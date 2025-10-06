# 1) Security headers (full block + filtered)
curl -I https://$STAGING_DOMAIN/
curl -sI https://$STAGING_DOMAIN/ | egrep -i "strict-transport|content-security|x-content-type|frame|referrer|set-cookie"

# 2) Rate-limit smoke (expects some 429)
for i in {1..40}; do
  curl -s -o /dev/null -w "%{http_code}\n"     -H "Authorization: Bearer $AUTH_TOKEN"     -H "Content-Type: application/json"     -X POST https://$STAGING_DOMAIN$BULK_DELETE_ENDPOINT     --data '{"ids":["id1","id2"]}'
done | sort | uniq -c

# 5) Probes
curl -s -o /dev/null -w "healthz:%{http_code}\n" https://$STAGING_DOMAIN$HEALTHZ_ENDPOINT
curl -s -o /dev/null -w "readyz:%{http_code}\n"  https://$STAGING_DOMAIN$READYZ_ENDPOINT
