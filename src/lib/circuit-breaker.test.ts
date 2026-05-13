 import { describe, it, expect, vi, beforeEach } from 'vitest';
 import { CircuitBreaker, CircuitBreakerError } from './circuit-breaker';
 
 describe('CircuitBreaker', () => {
   let breaker: CircuitBreaker;
 
   beforeEach(() => {
     breaker = new CircuitBreaker({
       name: 'TestBreaker',
       failureThreshold: 2,
       resetTimeout: 100, // 100ms for testing
     });
   });
 
   it('should start in CLOSED state', () => {
     const stats = breaker.getStats();
     expect(stats.state).toBe('CLOSED');
   });
 
   it('should execute successfully and stay CLOSED', async () => {
     const fn = vi.fn().mockResolvedValue('success');
     const result = await breaker.execute(fn);
     
     expect(result).toBe('success');
     expect(fn).toHaveBeenCalledTimes(1);
     expect(breaker.getStats().state).toBe('CLOSED');
   });
 
   it('should open the circuit after reaching failure threshold', async () => {
     const fn = vi.fn().mockRejectedValue(new Error('fail'));
     
     // First failure
     await expect(breaker.execute(fn)).rejects.toThrow('fail');
     expect(breaker.getStats().state).toBe('CLOSED');
     expect(breaker.getStats().failures).toBe(1);
 
     // Second failure (threshold reached)
     await expect(breaker.execute(fn)).rejects.toThrow('fail');
     expect(breaker.getStats().state).toBe('OPEN');
     expect(breaker.getStats().failures).toBe(2);
   });
 
   it('should fast-fail when the circuit is OPEN', async () => {
     const fn = vi.fn().mockRejectedValue(new Error('fail'));
     
     // Open the circuit
     await expect(breaker.execute(fn)).rejects.toThrow();
     await expect(breaker.execute(fn)).rejects.toThrow();
     expect(breaker.getStats().state).toBe('OPEN');
 
     // Next call should fail immediately without calling fn
     const fn2 = vi.fn();
     await expect(breaker.execute(fn2)).rejects.toThrow(CircuitBreakerError);
     expect(fn2).not.toHaveBeenCalled();
   });
 
   it('should transition to HALF_OPEN after reset timeout', async () => {
     const fn = vi.fn().mockRejectedValue(new Error('fail'));
     
     // Open the circuit
     await expect(breaker.execute(fn)).rejects.toThrow();
     await expect(breaker.execute(fn)).rejects.toThrow();
     
     // Wait for timeout
     await new Promise(r => setTimeout(r, 150));
     
     expect(breaker.isAvailable()).toBe(true);
     
     const fnSuccess = vi.fn().mockResolvedValue('ok');
     const result = await breaker.execute(fnSuccess);
     
     expect(result).toBe('ok');
     expect(breaker.getStats().state).toBe('CLOSED');
   });
 
   it('should return to OPEN if HALF_OPEN execution fails', async () => {
     const fn = vi.fn().mockRejectedValue(new Error('fail'));
     
     // Open the circuit
     await expect(breaker.execute(fn)).rejects.toThrow();
     await expect(breaker.execute(fn)).rejects.toThrow();
     
     // Wait for timeout
     await new Promise(r => setTimeout(r, 150));
     
     // Fail again during HALF_OPEN
     await expect(breaker.execute(fn)).rejects.toThrow('fail');
     expect(breaker.getStats().state).toBe('OPEN');
   });
 
   it('should manually reset to CLOSED', async () => {
     const fn = vi.fn().mockRejectedValue(new Error('fail'));
     await expect(breaker.execute(fn)).rejects.toThrow();
     await expect(breaker.execute(fn)).rejects.toThrow();
     expect(breaker.getStats().state).toBe('OPEN');
 
     breaker.reset();
     expect(breaker.getStats().state).toBe('CLOSED');
     expect(breaker.getStats().failures).toBe(0);
   });
 });