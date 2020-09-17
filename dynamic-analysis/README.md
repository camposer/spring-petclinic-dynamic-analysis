# Dynamic Analysis

## Definition

Read the blog post for more information: [A semi-deterministic approach for directing your legacy code modernisation and tests](https://medium.com/@camposer/a-semi-deterministic-approach-for-directing-your-legacy-code-modernisation-and-tests-58fb9d1987d8)

The 2x2 tool will give you a matrix of 4 quadrants and a centroid (using rankings):
* q1. Add tests. You should focus here for starting your modernisation. Ensure your harness is good enough in all layers related to these functions.
* q2. Modernise later. If the number of hits is considerably higher than the rest, this might be telling you that the system does this thing very well, it might be important, and you need to keep that flawless.
* q3. Discard. You might come later to these functions and modernise, but not now.
* q4. Investigate more. It would be ideal to trace and understand more about what is happening with these functions. Maybe your application is suffering from low performance and you would need to focus here first. For example: database queries performance tuning affecting the rest of the system.

About rankings: The algorithm uses rankings instead of plain averages, the idea is to remove noise caused by important differences from the sample

## How to capture logs

In order to capture logs you just need to run the app with the spring profile dynamic-analysis. For example:
```
java -Dspring.profiles.active=dynamic-analysis -jar target/spring-petclinic-2.3.0.BUILD-SNAPSHOT.jar | tee /tmp/petclinic.org
```

You can log execution time for a component:
1. Annotating a class (considers all public methods) with `@LogExecutionTime`. For example: [VisitRepository](../src/main/java/org/springframework/samples/petclinic/visit/VisitRepository.java)
2. Annotating a method with `@LogExecutionTime`. For example: [VetRepository](../src/main/java/org/springframework/samples/petclinic/vet/VetRepository.java)
3. Adding a regex to logging.components under [application.yml](../src/main/resources/application.yml)

Method 3) can be used when you don't want to change the code.

## How to use 2x2

You can run the following command:
```
./2x2.sh /tmp/petclinic.log org
```
That will show a matrix for all components containing the keyword **org** inside of the logs (captured previously)

The only requisite is to have installed nodejs, there's no need to use npm install for running the shell script, uses vanillaJS.

### Tests

If you want to run the tests:
```
npm install
npm run test
```


