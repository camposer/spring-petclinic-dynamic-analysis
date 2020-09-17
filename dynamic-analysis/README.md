# Dynamic Analysis

## How to use 2x2

You can run the following command:
```
./2x2.sh /tmp/petclinic.log org
```
That would show all components containing the keyword **org** inside of the logs (captured previously)

### Tests

If you want to run the tests:
```
npm run test
```

## Useful commands

Execution time by layer - you could replace Controller by Repository or something else
```
cat /tmp/petclinic.log | egrep -o "org\.springframework\.samples\.petclinic.+Controller.+ executed in [0-9]+" | sort -t ' ' -k 4 -n
```

Number of hits, min, max and average execution times 
```
cat /tmp/petclinic.log | egrep -o "org\.springframework\.samples\.petclinic\.owner\.OwnerController\.showOwner\(int\) executed in [0-9]+" | awk -F ' ' 'BEGIN { min = 9999; max = -1 } { hits++; sum += $4; if (min > $4) { min = $4 } if (max < $4) { max = $4 } } END { print "hits=" hits " min=" min " max=" max " avg=" (sum / hits) }'
```

Standard deviation and percentils 90th, 95th, 99th:
```
HITS=10000
AVG=143.296
cat /tmp/petclinic.log | egrep -o "org\.springframework\.samples\.petclinic\.owner\.OwnerController\.showOwner\(int\) executed in [0-9]+" | sort -t ' ' -k 4 -n | awk -v hits=$HITS -v avg=$AVG -F ' ' 'BEGIN { p90 = int(hits * 0.9); p95 = int(hits * 0.95); p99 = int(hits * 0.99) } { sum = ($4 - avg)^2; if (NR <= p90) { sumP90 += $4 } if (NR <= p95) { sumP95 += $4 } if (NR <= p99) { sumP99 += $4 }  } END { print "std=" sqrt(sum / hits) " p90=" (sumP90 / p90) " p95=" (sumP95 / p95) " p99=" (sumP99 / p99)  }'
```
NOTES: 
- Set HITS and AVG
- Get values from previous step
- The algorithm for percentils can be improved, see:
https://www.dummies.com/education/math/statistics/how-to-calculate-percentiles-in-statistics/

Methods, hits and avg - important for 2x2
```
cat /tmp/petclinic.log | egrep -o "org\.springframework\.samples\.petclinic.+Controller.+ executed in [0-9]+" | awk -F ' ' '{ hits[$1]++; time[$1] += $4 } END { for (i in hits) print i " " hits[i] " " (time[i] / hits[i]) }' | sort -t ' ' -k 3 -n | tail -5 > times
cat /tmp/petclinic.log | egrep -o "org\.springframework\.samples\.petclinic.+Controller.+ executed in [0-9]+" | awk -F ' ' '{ hits[$1]++; time[$1] += $4 } END { for (i in hits) print i " " hits[i] " " (time[i] / hits[i]) }' | sort -t ' ' -k 2 -n | tail -5 > hits
cat hits times | cut -f1 -d' ' | sort | uniq -c
```


