const { buildPrompt } = require('../src/services/promptBuilder');

describe('Prompt Builder', () => {
  test('builds grounded prompt', () => {
    const docs = [{ title: 'Doc 1', content: 'Content 1' }];
    const prompt = buildPrompt('What is this?', docs);
    expect(prompt).toContain('SYSTEM:');
    expect(prompt).toContain('Doc 1');
    expect(prompt).toContain('Content 1');
    expect(prompt).toContain('What is this?');
  });
});
