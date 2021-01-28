import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Please declare input file ? ', function(name) {
  const performances = JSON.parse(fs.readFileSync(name));
  const sortedPerformance = performances.sort((first, second) => {
    if (first.priority > second.priority) {
      return -1;
    }
    if (first.priority < second.priority) {
      return 1;
    }
    if (first.priority === second.priority) {
      if (first.start > second.start) {
        return 1;
      }
      if (first.start <= second.start) {
        return -1;
      }
    }
  });
  const times = performances.reduce((previous, current) => {
    if (Object.keys(previous).length === 0) {

      return {
        start: current.start,
        finish: current.finish,
      }
    } else {
      const currentStart = new Date(current.start);
      const currentFinish = new Date(current.finish);
      const previousStart = new Date(previous.start);
      const previousFinish = new Date(previous.finish);
      if (currentStart < previousStart) {
        previous.start = current.start;
      }
      if (currentFinish > previousFinish) {
        previous.finish = current.finish;
      }
  
      return previous;
    }
  }, {})

  const result = resolve(sortedPerformance, times.start, times.finish, []);
  fs.writeFileSync(name.replace('.json', '.optimal.json'), JSON.stringify(result));
  process.exit(0);
});

const resolve = (performances, startTime, endTime, result) => {
  const startWatch = new Date(startTime);
  const endWatchTime = new Date(endTime);
  if (startWatch >= endWatchTime) {
    return result;
  } else {
    let passedNode = [];
    for (const [idx, performance] of performances.entries()) {
      const performanceStart = new Date(performance.start);
      const performanceFinish = new Date(performance.finish);
      if (performanceStart <= startWatch && performanceFinish > startWatch) {
        passedNode.push(performanceFinish);
        passedNode.push(endWatchTime);
        const endWatch = new Date(Math.min.apply(null, passedNode));
        result.push({
          band: performance.band,
          start: startTime,
          finish: endWatch.toISOString(),
        })

        return resolve(
          performances,
          endWatch.toISOString(),
          endTime,
          result
        );
      } else if (performanceStart > startWatch) {
        passedNode.push(performanceStart);
        if (idx === performances.length - 1) { 

          return resolve(
            performances,
            new Date(Math.min.apply(null, passedNode)).toISOString(),
            endTime,
            result
          );
        }
      }
    }
    
  }
}
