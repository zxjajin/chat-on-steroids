import { positionOf } from '../../shared/chronology.js';
import { withoutMessageReaction } from '../../shared/message-reaction.js';
import { userPromptText } from '../../shared/user-prompt.js';
import { getSession, readAsset, readRecentEvents } from './store.js';

const PAGE_SIZE = 300;
const MAX_PAGES = 256;
const MAX_MARKDOWN_CHARS = 900_000;

/** User-requested export of the recorded conversation, without local tool payloads. */
export async function sessionMarkdown(id: string): Promise<string> {
  const summary = await getSession(id);
  if (!summary) throw new Error('Session not found');
  const pages: string[][] = [];
  let before = Number.POSITIVE_INFINITY;
  let length = 0;
  let complete = false;
  for (let index = 0; index < MAX_PAGES; index++) {
    const events = await readRecentEvents(id, PAGE_SIZE, {
      before, kinds: ['user_message', 'assistant_message'], orderByOrigin: true
    });
    if (!events.length) { complete = true; break; }
    const lines: string[] = [];
    for (const event of events) {
      if (event.kind !== 'user_message' && event.kind !== 'assistant_message') continue;
      let source = event.message.text;
      if (event.message.truncated && !(event.kind === 'user_message' && event.authoredText)) {
        const asset = event.message.assetId
          ? await readAsset(id, event.message.assetId, 4 * MAX_MARKDOWN_CHARS)
          : null;
        if (!asset) throw new Error('A complete recorded message is unavailable; the conversation was not copied');
        source = asset.toString('utf8');
      }
      const text = event.kind === 'user_message'
        ? event.authoredText ?? userPromptText(source.trimStart()) ?? source
        : withoutMessageReaction(source);
      const heading = event.kind === 'user_message' ? 'You' : event.final ? 'ChatGPT' : 'ChatGPT (partial)';
      const block = `## ${heading}\n\n${text}\n\n`;
      length += block.length;
      if (length > MAX_MARKDOWN_CHARS) throw new Error('Conversation exceeds the clipboard export limit');
      lines.push(block);
    }
    pages.push(lines);
    const oldest = Math.min(...events.map(positionOf));
    if (oldest >= before) throw new Error('Conversation history did not advance; the conversation was not copied');
    before = oldest;
    if (events.length < PAGE_SIZE) { complete = true; break; }
  }
  if (!complete) throw new Error('Conversation exceeds the export page limit');
  if (!pages.some(page => page.length)) throw new Error('No recorded messages are available to copy');
  const title = summary.title.replace(/\s+/g, ' ').trim() || 'Untitled session';
  return `# ${title}\n\n${pages.reverse().flat().join('')}`;
}
