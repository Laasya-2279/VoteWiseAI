const { logger, sanitize, LOG_LEVELS } = require('../src/utils/logger');

describe('Logger', () => {
  let stdoutSpy, stderrSpy;

  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
    stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sanitizes sensitive data', () => {
    const data = { password: 'secretpassword', token: 'mytoken', apiKey: '12345', normal: 'value', nested: { secret: 'hidden' } };
    const sanitized = sanitize(data);
    expect(sanitized.password).toBe('[REDACTED]');
    expect(sanitized.token).toBe('[REDACTED]');
    expect(sanitized.apiKey).toBe('[REDACTED]');
    expect(sanitized.normal).toBe('value');
    expect(sanitized.nested.secret).toBe('[REDACTED]');
  });

  it('sanitizes arrays', () => {
    const data = [{ password: 'secretpassword' }];
    const sanitized = sanitize(data);
    expect(sanitized[0].password).toBe('[REDACTED]');
  });

  it('does not crash on null/undefined', () => {
    expect(sanitize(null)).toBe(null);
    expect(sanitize(undefined)).toBe(undefined);
    expect(sanitize('string')).toBe('string');
  });

  it('logs debug, info, warn, error correctly', () => {
    // In test environment, currentLevel is ERROR (3), so debug, info, warn should not write.
    logger.debug('debug msg');
    logger.info('info msg');
    logger.warn('warn msg');
    expect(stdoutSpy).not.toHaveBeenCalled();
    expect(stderrSpy).not.toHaveBeenCalled();

    logger.error('error msg');
    expect(stderrSpy).toHaveBeenCalled();
  });

  it('handles error objects in meta', () => {
    logger.error('error msg', new Error('test error'));
    expect(stderrSpy).toHaveBeenCalled();
    const callArgs = stderrSpy.mock.calls[0][0];
    expect(callArgs).toContain('test error');
  });
});
