# Cost Tracking - Deployment Checklist

## Pre-Deployment

### 1. Database Setup
- [ ] Run migration: `npx prisma db push`
- [ ] Verify table created: `SELECT * FROM "CostTracking" LIMIT 1;`
- [ ] Check indexes: `\d "CostTracking"` (PostgreSQL)

### 2. Dependencies
- [ ] Verify recharts installed: `npm list recharts`
- [ ] All imports resolve correctly
- [ ] No TypeScript errors: `npm run type-check`

### 3. Environment Variables
- [ ] `DATABASE_URL` configured
- [ ] `GOOGLE_AI_API_KEY` or `GOOGLE_AI_API_KEY_1` set (for LLM)
- [ ] No additional env vars needed (system works with existing setup)

### 4. Testing
- [ ] Run test script: `npx tsx scripts/test-cost-tracking.ts`
- [ ] Verify data appears in database
- [ ] Check dashboard loads: `http://localhost:3000/dashboard/costs`
- [ ] Test API endpoints:
  ```bash
  curl http://localhost:3000/api/admin/costs?view=summary
  curl http://localhost:3000/api/admin/costs?view=daily
  curl http://localhost:3000/api/admin/costs?view=top-users
  curl http://localhost:3000/api/admin/costs?view=projection
  ```

## Deployment Steps

### 1. Code Deployment
- [ ] Commit all files to git
- [ ] Push to main branch
- [ ] Deploy to production (Vercel/etc)

### 2. Database Migration (Production)
- [ ] Run on production: `npx prisma db push` or `npx prisma migrate deploy`
- [ ] Verify migration successful
- [ ] Check table exists in production DB

### 3. Verification
- [ ] Visit production dashboard: `https://your-domain.com/dashboard/costs`
- [ ] Send a test message to trigger tracking
- [ ] Wait 10 seconds for buffer flush
- [ ] Refresh dashboard - should see data
- [ ] Check API endpoints work

### 4. Access Control (Optional)
- [ ] Add `isAdmin` field to User model if needed
- [ ] Uncomment admin check in `/app/api/admin/costs/route.ts`
- [ ] Test with non-admin user (should get 403)
- [ ] Test with admin user (should work)

## Post-Deployment

### 1. Monitoring Setup
- [ ] Bookmark dashboard URL
- [ ] Set reminder to check daily
- [ ] Configure budget alerts (future feature)
- [ ] Add to team documentation

### 2. Alert Configuration
Current automatic alerts:
- [ ] Verify alert for daily cost > $50
- [ ] Verify alert for monthly projection > $1,000
- [ ] Verify alert for user cost > $10/day
- [ ] Verify alert for trend > 20% increase

### 3. Team Training
- [ ] Share Quick Start guide with team
- [ ] Demo dashboard to stakeholders
- [ ] Explain alert system
- [ ] Document how to add tracking to new endpoints

### 4. Documentation
- [ ] Add link to dashboard in main README
- [ ] Update API documentation with new endpoints
- [ ] Share cost analysis with finance team
- [ ] Document monthly review process

## Ongoing Maintenance

### Daily (2 min)
- [ ] Quick dashboard check
- [ ] Review any alerts
- [ ] Check for cost anomalies

### Weekly (15 min)
- [ ] Analyze cost trends
- [ ] Review top users
- [ ] Check model distribution
- [ ] Look for optimization opportunities

### Monthly (1 hour)
- [ ] Full cost analysis
- [ ] Compare actual vs projected
- [ ] Update budget forecast
- [ ] Review pricing tables (are they still accurate?)
- [ ] Plan optimizations
- [ ] Report to stakeholders

### Quarterly
- [ ] Deep-dive analysis
- [ ] Evaluate model alternatives
- [ ] Review provider pricing changes
- [ ] Update calculator.ts if needed
- [ ] Consider new features (alerts, limits, etc)

## Troubleshooting

### Issue: No data in dashboard
**Checklist:**
- [ ] Database migration ran successfully?
- [ ] Tracking code integrated in endpoints?
- [ ] Buffer flushed? (wait 10 seconds)
- [ ] Check server logs for errors
- [ ] Run test script to generate sample data

### Issue: Costs seem wrong
**Checklist:**
- [ ] Model name matches pricing table?
- [ ] Token estimation accurate?
- [ ] Pricing table up-to-date?
- [ ] Check calculator.ts for model
- [ ] Verify actual API pricing

### Issue: Dashboard not loading
**Checklist:**
- [ ] Next.js build successful?
- [ ] Recharts installed?
- [ ] Check browser console for errors
- [ ] Verify API endpoint works (curl)
- [ ] Check authentication (logged in?)

### Issue: High costs suddenly
**Checklist:**
- [ ] Check top users for abuse
- [ ] Review recent code changes
- [ ] Check for API loops
- [ ] Verify rate limiting working
- [ ] Look for DDoS attempts

## Security Considerations

### Access Control
- [ ] Dashboard requires authentication
- [ ] Consider admin-only access
- [ ] Don't expose API publicly
- [ ] Rate limit API endpoints

### Data Privacy
- [ ] CostTracking table doesn't store message content
- [ ] Only metadata tracked
- [ ] User IDs are hashed/encrypted in DB
- [ ] Comply with GDPR/privacy laws

### Cost Protection
- [ ] Rate limiting on expensive operations
- [ ] Budget alerts configured
- [ ] Auto-throttling considered (future)
- [ ] Emergency shutdown procedure documented

## Rollback Plan

If something goes wrong:

### 1. Quick Rollback
```bash
# Disable tracking without removing DB
# Comment out tracking calls in:
# - lib/services/message.service.ts
# - lib/memory/qwen-embeddings.ts
# - lib/visual-system/visual-generation-service.ts
```

### 2. Full Rollback
```bash
# Remove table from database
DROP TABLE "CostTracking";

# Revert git commits
git revert <commit-hash>
```

### 3. Partial Rollback
```bash
# Keep database, remove UI
# Delete dashboard page
rm -rf app/dashboard/costs/

# Keep tracking, remove API
rm -rf app/api/admin/costs/
```

## Success Criteria

Deployment is successful when:
- [x] Database migrated without errors
- [x] Test script passes
- [x] Dashboard loads and displays data
- [x] API endpoints return valid responses
- [x] Tracking integrated in main flows
- [x] Costs are being recorded
- [x] Projections are calculated
- [x] Alerts are generated
- [x] No performance degradation
- [x] No errors in logs

## Final Checks

Before marking as complete:
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Documentation complete
- [ ] Team trained
- [ ] Monitoring active
- [ ] Backup/rollback plan ready
- [ ] Stakeholders informed
- [ ] Success metrics defined

## Sign-off

- [ ] **Developer:** Tested locally ✓
- [ ] **QA:** Verified in staging ⏳
- [ ] **DevOps:** Deployed to production ⏳
- [ ] **Product:** Approved for release ⏳
- [ ] **Finance:** Budget alerts configured ⏳

---

## Quick Commands Reference

```bash
# Migration
npx prisma db push

# Testing
npx tsx scripts/test-cost-tracking.ts

# Type checking
npm run type-check

# Build
npm run build

# Database query
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"CostTracking\";"

# View recent costs
psql $DATABASE_URL -c "SELECT type, provider, cost, \"createdAt\" FROM \"CostTracking\" ORDER BY \"createdAt\" DESC LIMIT 10;"
```

---

**Status:** Ready for deployment ✅

**Risk Level:** Low (non-breaking, optional feature)

**Estimated Deployment Time:** 15-30 minutes

**Rollback Time:** < 5 minutes
