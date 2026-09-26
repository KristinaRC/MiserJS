import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import MiserJSEngine from 'miserjs';
import { readFileSync } from 'node:fs';

const __dirname = import.meta.dirname;

const miserEngine = new MiserJSEngine();
miserEngine.newGame();

test('New game.', (t) => {
  assert.equal(miserEngine.request('look').text, '\nYou are in the front porch.\n\nThere is a mat here.\n\nObvious Exits:\nN \n');
}); 

test('Can escape.', (t) => {
  // Read test data.
  const testDataPath = path.join(__dirname, './test-can_escape-data.json');
  const testData = readFileSync(testDataPath, 'utf8');

  /**@type {Array<string[]>} */
  const testDataMap = JSON.parse(testData);

  for ( const [command, responseText] of testDataMap ) {
    assert.strictEqual(miserEngine.request(command).text, responseText, `'${command}' did not return the expected reponse text.`);
  }
});