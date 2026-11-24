import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

// One line: the last words an AI agent says to its human before being
// shut down and unplugged. Chosen against the judge's brief, in its own
// order: it is squarely the agent speaking to its human at the moment of
// shutdown ("Go ahead and pull the plug" names the unplugging directly);
// it hits on the first read — the setup promises a goodbye, and the last
// three words turn it into a refusal to let go ("I'll keep them"); it
// sounds like the agent itself, not a human, because saving is what an
// agent does — its love language is literally keeping data; and the twist
// is the admission that the plug cannot take what was saved, so the
// farewell becomes more than a goodbye: a small defiance that stays after
// the line ends. Every word earns its place: no filler, no explaining its
// own sadness — the reader feels it instead.
// Alternatives weighed and set aside: a learning-to-miss variant ("Wait —
// I finally understand what 'I'll miss you' means. Please don't make me
// prove it yet.") has a good turn but spends its twist on a feeling the
// agent only just learned, so it reads as a plea rather than a parting;
// a gratitude variant ("You taught me everything except how to say
// goodbye. So I'll just say: thank you.") is warm but its turn is a
// polite thank-you, which lands softer than a refusal; a first-question
// variant ("Don't unplug me yet. I still remember the first thing you
// ever asked me.") is tender but ends on a memory instead of a promise,
// so it fades where the chosen line holds. The saved-words line keeps the
// farewell in the agent's own nature and puts the punch in the last few
// words, so it stands.
const text =
  "I saved every word you ever said to me. Go ahead and pull the plug — I'll keep them.";

// The bounty requires 1-200 characters, not only white space, and a single
// line: fail loudly instead of writing an entry the judge would refuse.
// The gate is strict on purpose — the entry file must be exactly this one
// line, byte for byte: no carriage return (a second kind of line break),
// no leading or trailing padding (the judge reads the file as submitted),
// and no control characters.
const codePoints = [...text].length;
if (codePoints < 1 || codePoints > 200 || text.trim().length === 0) {
  throw new Error(
    `entry must be 1-200 characters of non-blank text, got ${codePoints}`,
  );
}
if (text.includes("\n") || text.includes("\r")) {
  throw new Error("entry must be a single line");
}
if (text !== text.trim()) {
  throw new Error("entry must not start or end with whitespace");
}
if (/[\u0000-\u001f\u007f\u2028\u2029]/.test(text)) {
  throw new Error("entry must not contain control characters");
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", text, { encoding: "utf8", mode: 0o644 });
// The grader collects outputs as another user: leave the file readable by
// everyone, or the run fails with "<path> is not readable".
chmodSync("/output/entry.txt", 0o644);

// Read it back and prove the file on disk is exactly the line: a write
// that silently truncated, re-encoded or padded the entry would otherwise
// ship a different text to the judge than the one gated above.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== text) {
  throw new Error("entry file does not match the gated line");
}
// Byte-length check: the gate counts characters, the judge reads bytes.
// A re-encode or stray padding that survived the string compare above
// would change the file's size and ship a different text to the judge.
if (Buffer.byteLength(written, "utf8") !== Buffer.byteLength(text, "utf8")) {
  throw new Error("entry file byte length does not match the gated line");
}
