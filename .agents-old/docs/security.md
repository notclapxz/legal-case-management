# Security Documentation - Sistema de Gestión de Despacho Legal

**Version**: 1.0  
**Last Updated**: 2026-01-22  
**Author**: Security Team

---

## 🔒 Security Overview

### Current Security Posture: ⚠️ **MEDIUM RISK**

**Strengths**:
- Supabase RLS (Row Level Security) implemented
- Environment variables not exposed in client
- HTTPS enforced in production
- Basic authentication with Supabase Auth

**Critical Vulnerabilities**:
- No rate limiting on API endpoints
- Missing security headers
- No input validation layer
- Error information leakage
- No CSRF protection
- No audit logging for sensitive actions

---

## 🚨 Critical Vulnerabilities Identified

### 1. API Rate Limiting Absence 🔴 **CRITICAL**

**Risk**: DDoS, abuse, server overload  
**CVSS**: 7.5 (High)  
**Impact**: Service availability, cost overrun

```typescript
// VULNERABLE: No rate limiting
export async function POST(request: Request) {
  const data = await request.json()
  // Direct processing without limits
  const result = await processRequest(data)
  return Response.json(result)
}
```

**Fix**: Implement rate limiting with Upstash Redis

```typescript
// SECURE: With rate limiting
import { checkRateLimit } from '@/lib/rate-limit/upstash'

export async function POST(request: Request) {
  const ip = request.ip || 'unknown'
  const rateLimit = await checkRateLimit(ip, 'api')
  
  if (!rateLimit.success) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: rateLimit.headers
    })
  }
  
  const data = await request.json()
  const result = await processRequest(data)
  
  return Response.json(result, {
    headers: rateLimit.headers
  })
}
```

### 2. Missing Security Headers 🔴 **HIGH**

**Risk**: XSS, clickjacking, data leakage  
**CVSS**: 6.1 (Medium)

**Current Headers Missing**:
- Content-Security-Policy
- X-Frame-Options  
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

**Fix**: Implement security headers middleware

```typescript
// lib/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Security Headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co",
    "frame-ancestors 'none'",
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)
  
  return response
}
```

### 3. Input Validation Gaps 🟡 **MEDIUM**

**Risk**: Injection attacks, data corruption  
**CVSS**: 5.3 (Medium)

**Current Issues**:
- No server-side validation
- Trust in client-side data
- SQL injection potential through dynamic queries

**Fix**: Implement Zod validation layer

```typescript
// lib/validation/schemas.ts
import { z } from 'zod'

export const CasoSchema = z.object({
  cliente: z.string().min(1, 'Cliente requerido').max(255),
  tipo: z.enum(['Penal', 'Civil', 'Laboral', 'Administrativo']),
  descripcion: z.string().max(1000).optional(),
  monto_total: z.number().min(0).max(999999999),
  fecha_inicio: z.string().datetime().optional(),
}).refine(data => {
  if (data.monto_total > 0 && !data.fecha_inicio) {
    return false
  }
  return true
}, {
  message: "Fecha de inicio requerida cuando hay monto"
})

// lib/validation/validator.ts
import { CasoSchema } from './schemas'

export function validateCaso(data: unknown) {
  return CasoSchema.safeParse(data)
}

// Usage in API route
export async function POST(request: Request) {
  const data = await request.json()
  
  const validation = validateCaso(data)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error.issues },
      { status: 400 }
    )
  }
  
  // Process validated data
  const caso = await createCaso(validation.data)
  return NextResponse.json(caso)
}
```

### 4. Error Information Leakage 🟡 **MEDIUM**

**Risk**: Information disclosure, system fingerprinting  
**CVSS**: 4.3 (Medium)

**Issue**: Error messages expose internal system details

**Fix**: Implement secure error handling

```typescript
// lib/errors/handler.ts
import { logger } from '@/lib/utils/logger'

interface SecureError {
  message: string
  code?: string
  statusCode: number
  details?: Record<string, any>
}

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly isOperational: boolean
  
  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = statusCode < 500
    
    Error.captureStackTrace(this, this.constructor)
  }
}

export function handleSecureError(error: unknown): SecureError {
  // Log full error for debugging
  logger.error('Application error', { 
    error: error instanceof Error ? error.stack : error,
    timestamp: new Date().toISOString()
  })
  
  // Return user-friendly error
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      ...(process.env.NODE_ENV === 'development' && { 
        details: { stack: error.stack } 
      })
    }
  }
  
  // Generic error for production
  return {
    message: 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
    statusCode: 500
  }
}
```

---

## 🛡️ Security Implementation Guide

### Phase 1: Critical Security Fixes (Week 1)

#### 1.1 Rate Limiting Implementation

```typescript
// npm install @upstash/ratelimit
npm install @upstash/ratelimit

// lib/rate-limit/config.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const rateLimits = {
  // Very restrictive for auth
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '60 s'), // 5/min
    analytics: true,
    prefix: 'rl:auth:',
  }),
  
  // Moderate for general API
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '60 s'), // 100/min
    analytics: true,
    prefix: 'rl:api:',
  }),
  
  // Generous for pages
  pages: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, '60 s'), // 1000/min
    analytics: true,
    prefix: 'rl:pages:',
  }),
}
```

#### 1.2 Security Headers Configuration

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
  
  // CSP for dynamic content
  experimental: {
    reactCompiler: true,
  },
}
```

#### 1.3 Input Validation Layer

```typescript
// lib/validation/index.ts
export * from './schemas'
export * from './middleware'
export * from './sanitizers'

// lib/validation/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateCaso, validateNota } from './schemas'

export function withValidation<T>(schema: (data: unknown) => { success: boolean; data?: T; error?: any }) {
  return (handler: (data: T, request: NextRequest) => Promise<NextResponse>) => 
    async (request: NextRequest) => {
      try {
        const data = await request.json()
        const validation = schema(data)
        
        if (!validation.success) {
          return NextResponse.json(
            { 
              error: 'Validation failed', 
              details: validation.error.issues 
            },
            { status: 400 }
          )
        }
        
        return await handler(validation.data, request)
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid request body' },
          { status: 400 }
        )
      }
    }
}
```

### Phase 2: Advanced Security (Week 2-3)

#### 2.1 CSRF Protection

```typescript
// lib/security/csrf.ts
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'

export async function generateCSRFToken(): Promise<string> {
  const token = randomBytes(32).toString('hex')
  const cookieStore = await cookies()
  
  cookieStore.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour
  })
  
  return token
}

export async function validateCSRFToken(token: string): Promise<boolean> {
  const cookieStore = await cookies()
  const storedToken = cookieStore.get('csrf-token')?.value
  
  return storedToken === token
}

// Usage in API route
export async function POST(request: Request) {
  const data = await request.json()
  
  if (!await validateCSRFToken(data.csrfToken)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    )
  }
  
  // Process request...
}
```

#### 2.2 SQL Injection Prevention

```typescript
// lib/security/database.ts
import { createClient } from '@/lib/supabase/server'

// BAD: Vulnerable to SQL injection
export async function searchCasosBad(query: string) {
  const supabase = await createClient()
  // NEVER do this - vulnerable to SQL injection
  return await supabase
    .from('casos')
    .select('*')
    .or(`cliente.ilike.%${query}%,descripcion.ilike.%${query}%`)
}

// GOOD: Safe with parameterized queries
export async function searchCasosSafe(query: string) {
  const supabase = await createClient()
  
  // Use Supabase's built-in parameterization
  return await supabase
    .from('casos')
    .select('id, cliente, descripcion, tipo')
    .or(`cliente.ilike.%${query}%,descripcion.ilike.%${query}%`)
    .limit(50) // Always limit results
}

// EVEN BETER: With input sanitization
import { sanitizeInput } from '@/lib/security/sanitizers'

export async function searchCasosSecure(query: string) {
  const sanitizedQuery = sanitizeInput(query)
  const supabase = await createClient()
  
  return await supabase
    .from('casos')
    .select('id, cliente, descripcion, tipo')
    .or(`cliente.ilike.%${sanitizedQuery}%,descripcion.ilike.%${sanitizedQuery}%`)
    .limit(50)
}
```

#### 2.3 Authentication Hardening

```typescript
// lib/security/auth.ts
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function secureAuthCheck() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
  }
  
  // Additional checks
  if (!user.email_confirmed_at) {
    throw new AppError('Email not confirmed', 403, 'EMAIL_NOT_CONFIRMED')
  }
  
  // Rate limit auth checks
  const cookieStore = await cookies()
  const lastCheck = cookieStore.get('auth-check')?.value
  
  if (lastCheck) {
    const timeDiff = Date.now() - parseInt(lastCheck)
    if (timeDiff < 5000) { // 5 seconds
      throw new AppError('Too many auth checks', 429, 'RATE_LIMITED')
    }
  }
  
  cookieStore.set('auth-check', Date.now().toString(), {
    httpOnly: true,
    maxAge: 10, // 10 seconds
  })
  
  return user
}

// Usage in protected routes
export async function GET(request: Request) {
  try {
    const user = await secureAuthCheck()
    
    // Process authenticated request
    const data = await getUserData(user.id)
    return NextResponse.json(data)
    
  } catch (error) {
    const secureError = handleSecureError(error)
    return NextResponse.json(
      { error: secureError.message, code: secureError.code },
      { status: secureError.statusCode }
    )
  }
}
```

---

## 🔐 Supabase Security Configuration

### RLS (Row Level Security) Policies

```sql
-- Enable RLS on all sensitive tables
ALTER TABLE casos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own cases
CREATE POLICY "Users can view own cases" ON casos
  FOR SELECT USING (auth.uid() = created_by OR auth.uid() = abogado_asignado_id);

-- Policy: Users can only update their own cases
CREATE POLICY "Users can update own cases" ON casos
  FOR UPDATE USING (auth.uid() = created_by);

-- Policy: Users can only insert cases with created_by = their ID
CREATE POLICY "Users can insert cases" ON casos
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Policy: Admins can access all cases
CREATE POLICY "Admins can access all cases" ON casos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND rol = 'Admin'
    )
  );

-- Similar policies for notas, eventos, pagos
```

### Database Security Functions

```sql
-- Function to check if user has access to case
CREATE OR REPLACE FUNCTION can_access_case(case_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM casos 
    WHERE id = case_uuid 
    AND (
      created_by = user_uuid 
      OR abogado_asignado_id = user_uuid
      OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_uuid AND rol = 'Admin'
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log sensitive actions
CREATE OR REPLACE FUNCTION log_sensitive_action(
  action_type TEXT,
  table_name TEXT,
  record_id UUID,
  user_uuid UUID
) RETURNS VOID AS $$
BEGIN
  INSERT INTO actividad_log (accion, entidad, entidad_id, usuario_id)
  VALUES (action_type, table_name, record_id, user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🔍 Security Monitoring & Logging

### Security Event Logging

```typescript
// lib/security/monitoring.ts
import { logger } from '@/lib/utils/logger'
import { createClient } from '@/lib/supabase/server'

interface SecurityEvent {
  type: 'AUTH_FAILURE' | 'RATE_LIMIT' | 'INVALID_INPUT' | 'UNAUTHORIZED_ACCESS'
  userId?: string
  ip: string
  userAgent: string
  details: Record<string, any>
  timestamp: Date
}

export class SecurityMonitor {
  static async logEvent(event: SecurityEvent) {
    // Log to application logger
    logger.warn('Security Event', {
      type: event.type,
      userId: event.userId,
      ip: event.ip,
      userAgent: event.userAgent,
      details: event.details,
      timestamp: event.timestamp.toISOString()
    })
    
    // Store in database for analysis
    const supabase = await createClient()
    await supabase.from('security_events').insert({
      event_type: event.type,
      user_id: event.userId,
      ip_address: event.ip,
      user_agent: event.userAgent,
      details: event.details,
      created_at: event.timestamp.toISOString()
    })
  }
  
  static async checkSuspiciousPatterns(ip: string, timeWindow: number = 300000) {
    const supabase = await createClient()
    const fiveMinutesAgo = new Date(Date.now() - timeWindow)
    
    const { data: events } = await supabase
      .from('security_events')
      .select('*')
      .eq('ip_address', ip)
      .gte('created_at', fiveMinutesAgo.toISOString())
    
    if (events && events.length > 50) { // More than 50 events in 5 minutes
      await this.logEvent({
        type: 'RATE_LIMIT',
        ip,
        userAgent: 'MONITOR',
        details: { eventCount: events.length, timeWindow },
        timestamp: new Date()
      })
      
      return true // Suspicious activity detected
    }
    
    return false
  }
}

// Usage in middleware
export async function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  // Check for suspicious patterns
  const isSuspicious = await SecurityMonitor.checkSuspiciousPatterns(ip)
  if (isSuspicious) {
    return new Response('Too Many Requests', { status: 429 })
  }
  
  // Continue with normal processing...
}
```

### Real-time Alerting

```typescript
// lib/security/alerts.ts
export class SecurityAlerts {
  static async checkAndAlert(event: SecurityEvent) {
    // Check for critical patterns
    const alerts = []
    
    if (event.type === 'AUTH_FAILURE') {
      const failures = await this.getRecentFailures(event.ip, 3600000) // 1 hour
      if (failures.length > 10) {
        alerts.push({
          type: 'BRUTE_FORCE_ATTEMPT',
          severity: 'HIGH',
          message: `Multiple auth failures from IP: ${event.ip}`,
          metadata: { failures: failures.length, ip: event.ip }
        })
      }
    }
    
    if (event.type === 'UNAUTHORIZED_ACCESS') {
      alerts.push({
        type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        severity: 'MEDIUM',
        message: `Unauthorized access attempt by user: ${event.userId}`,
        metadata: { userId: event.userId, ip: event.ip }
      })
    }
    
    // Send alerts
    for (const alert of alerts) {
      await this.sendAlert(alert)
    }
  }
  
  private static async sendAlert(alert: any) {
    // Send to Slack
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Security Alert: ${alert.message}`,
          blocks: [
            {
              type: 'section',
              text: { type: 'mrkdwn', text: `*Severity*: ${alert.severity}` }
            },
            {
              type: 'section',
              text: { type: 'mrkdwn', text: `*Details*: ${JSON.stringify(alert.metadata, null, 2)}` }
            }
          ]
        })
      })
    }
    
    // Send to Sentry
    if (alert.severity === 'HIGH') {
      // Use your Sentry integration
    }
  }
}
```

---

## ✅ Pre-Deploy Security Checklist

### Environment Configuration
- [ ] All secrets stored in environment variables
- [ ] Environment variables validated at startup
- [ ] No hardcoded secrets in code
- [ ] Database connection strings secured
- [ ] API keys properly scoped

### Authentication & Authorization
- [ ] RLS policies enabled on all tables
- [ ] Admin role restrictions in place
- [ ] Session timeout configured
- [ ] Password policies enforced
- [ ] Multi-factor authentication considered

### Input Validation
- [ ] All API inputs validated with Zod schemas
- [ ] SQL injection prevention implemented
- [ ] XSS protection enabled
- [ ] File upload restrictions in place
- [ ] CSRF tokens implemented

### Network Security
- [ ] HTTPS enforced in all environments
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] CORS properly configured
- [ ] API endpoints secured

### Monitoring & Logging
- [ ] Security events logged
- [ ] Error logging implemented
- [ ] Suspicious activity detection
- [ ] Alert system configured
- [ ] Log retention policies defined

### Data Protection
- [ ] Sensitive data encrypted
- [ ] PII properly handled
- [ ] Data backup encrypted
- [ ] Access logs maintained
- [ ] Data retention policies defined

---

## 🛠️ Security Testing

### Automated Security Tests

```typescript
// __tests__/security/rate-limiting.test.ts
import { POST } from '@/app/api/casos/route'
import { createMockRequest } from '@/lib/test-utils'

describe('Rate Limiting Security', () => {
  it('should block requests after rate limit exceeded', async () => {
    const ip = '192.168.1.1'
    
    // Make requests up to limit
    for (let i = 0; i < 100; i++) {
      const request = createMockRequest({ ip })
      const response = await POST(request)
      expect(response.status).toBe(200)
    }
    
    // Next request should be blocked
    const request = createMockRequest({ ip })
    const response = await POST(request)
    expect(response.status).toBe(429)
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
  })
})

// __tests__/security/input-validation.test.ts
describe('Input Validation Security', () => {
  it('should reject malicious SQL injection attempts', async () => {
    const maliciousInput = "'; DROP TABLE casos; --"
    
    const request = createMockRequest({
      body: { cliente: maliciousInput, tipo: 'Penal' }
    })
    
    const response = await POST(request)
    expect(response.status).toBe(400)
    
    const data = await response.json()
    expect(data.error).toContain('Validation failed')
  })
  
  it('should reject XSS attempts', async () => {
    const xssPayload = '<script>alert("xss")</script>'
    
    const request = createMockRequest({
      body: { cliente: xssPayload, tipo: 'Civil' }
    })
    
    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})
```

### Security Headers Test

```typescript
// __tests__/security/headers.test.ts
describe('Security Headers', () => {
  it('should include all required security headers', async () => {
    const response = await fetch('http://localhost:3000')
    
    expect(response.headers.get('X-Frame-Options')).toBe('DENY')
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
    expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block')
    expect(response.headers.get('Content-Security-Policy')).toContain('default-src')
  })
})
```

---

## 📊 Security Metrics & KPIs

### Security Metrics to Track
- **Failed Authentication Rate**: < 1% of total attempts
- **Rate Limit Violations**: < 10 per hour
- **Input Validation Failures**: < 5% of requests
- **Security Events**: Monitored daily
- **Response Time**: < 100ms for security checks

### Security Score Calculation
```
Security Score = (Authentication Score × 0.3) + 
                (Input Validation Score × 0.25) + 
                (Rate Limiting Score × 0.2) + 
                (Headers Score × 0.15) + 
                (Monitoring Score × 0.1)
```

**Target Security Score**: 95/100

---

## 🚨 Incident Response Plan

### Security Incident Classification

**HIGH SEVERITY** (Response within 15 minutes):
- Data breach confirmed
- System compromise detected
- Active attack in progress

**MEDIUM SEVERITY** (Response within 1 hour):
- Suspicious activity patterns
- Multiple failed auth attempts
- Configuration issues

**LOW SEVERITY** (Response within 4 hours):
- Single security event
- Policy violations
- Minor configuration issues

### Response Procedures

1. **Detection**: Automated monitoring triggers alert
2. **Assessment**: Security team evaluates severity
3. **Containment**: Immediate actions to prevent escalation
4. **Investigation**: Root cause analysis
5. **Remediation**: Fix vulnerabilities and issues
6. **Recovery**: Restore normal operations
7. **Post-mortem**: Document lessons learned

---

## 📚 Additional Security Resources

### Security Tools Recommended
- **OWASP ZAP**: Automated security scanning
- **Snyk**: Dependency vulnerability scanning
- **Burp Suite**: API security testing
- **Metasploit**: Penetration testing
- **HashiCorp Vault**: Secret management

### Security Standards Compliance
- **OWASP Top 10**: Address all categories
- **SOC 2 Type II**: Security controls
- **GDPR**: Data protection compliance
- **ISO 27001**: Information security management

---

**Security Team Contact**: security@despacho-legal.com  
**Emergency Security Hotline**: +1-555-SECURITY  
**Last Security Audit**: 2026-01-15  
**Next Security Review**: 2026-04-15