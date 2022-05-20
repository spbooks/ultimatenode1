# Worker Thread Demonstration

This app throws two dice 1 billion times and records the total score frequency.

The first run makes a standard call to the `diceRun()` function. The Node.js event loop halts until this completes -- no other processes can execute.

The second run calls `diceRun()` from a Worker Thread. It executes independently from the main Node.js event loop so other processes continue to execute.

To run the example, navigate to this directory in your terminal and run:

```sh
node index.js
```
