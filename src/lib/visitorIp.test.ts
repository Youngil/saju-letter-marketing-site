import { describe, expect, it } from 'vitest';
import { normalizeIpAddress, pickVisitorIp } from './visitorIp';

describe('pickVisitorIp — X-Forwarded-For의 맨 오른쪽(Cloud Run 앞단이 덧붙인 값, 2026-10-07 전체 점검 12차)', () => {
  it('항목이 하나면 그 값', () => {
    expect(pickVisitorIp('203.0.113.9')).toBe('203.0.113.9');
  });

  it('여러 개면 맨 오른쪽 — 앞의 값은 방문자가 직접 보낸 값이라 믿지 않는다', () => {
    expect(pickVisitorIp('1.2.3.4, 203.0.113.9')).toBe('203.0.113.9');
    expect(pickVisitorIp('spoofed,  2001:DB8::1 ')).toBe('2001:db8::1');
  });

  it('없거나 맨 오른쪽이 IP 모양이 아니면 undefined(앞의 값으로 물러나지 않는다)', () => {
    expect(pickVisitorIp(null)).toBeUndefined();
    expect(pickVisitorIp(undefined)).toBeUndefined();
    expect(pickVisitorIp('')).toBeUndefined();
    expect(pickVisitorIp(' , ')).toBeUndefined();
    expect(pickVisitorIp('203.0.113.9, unknown')).toBeUndefined();
  });
});

describe('normalizeIpAddress', () => {
  it('IPv4는 그대로, 범위를 벗어난 값은 거른다', () => {
    expect(normalizeIpAddress('8.8.8.8')).toBe('8.8.8.8');
    expect(normalizeIpAddress('256.1.1.1')).toBeUndefined();
    expect(normalizeIpAddress('1.2.3')).toBeUndefined();
    expect(normalizeIpAddress('01.2.3.4')).toBeUndefined();
  });

  it('IPv4-mapped IPv6는 IPv4로, IPv6는 소문자 압축형으로', () => {
    expect(normalizeIpAddress('::ffff:127.0.0.1')).toBe('127.0.0.1');
    expect(normalizeIpAddress('::1')).toBe('::1');
    expect(normalizeIpAddress('2001:0DB8:0000:0000:0000:0000:0000:0001')).toBe('2001:db8::1');
  });

  it('IP가 아닌 값(헤더 주입 시도 포함)은 undefined', () => {
    expect(normalizeIpAddress('example.com')).toBeUndefined();
    expect(normalizeIpAddress('1.2.3.4\r\nX-Evil: 1')).toBeUndefined();
    expect(normalizeIpAddress('fe80::1%eth0')).toBeUndefined();
    expect(normalizeIpAddress('1:2:3')).toBeUndefined();
    expect(normalizeIpAddress(42)).toBeUndefined();
    expect(normalizeIpAddress(undefined)).toBeUndefined();
  });
});
