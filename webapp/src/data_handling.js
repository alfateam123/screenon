const turned_off = (on_off) => on_off === false;
const turned_on = (on_off) => on_off === true;

// Note that all records in `data` should be of the same day.
function cumulated_time(data) {
    if(data.length === 0) {
        return [];
    }

    let cumulated = [];
    let currentTotal = 0;
    let realData = data;
    cumulated.push({instant: data[0].instant, value: 0});
    for(let i=0; i<realData.length-1; i+=1) {
        if(turned_on(realData[i].on_off)) {
            let delta = realData[i+1].instant - realData[i].instant;
            cumulated.push({instant: realData[i+1].instant, value: currentTotal + delta});
            currentTotal += delta;
        }
        else {
            cumulated.push({instant: realData[i+1].instant, value: currentTotal});
        }
    }

    return cumulated;
}

function _group_by(data, ranges_number, time_format) {
  let result = [];
  for(let i=0; i<ranges_number; i++){
    result.push({interval: i, hits: 0});
  }

  data.forEach(entry => {
    let hour_of_entry = 1 * moment.unix(entry.instant).format(time_format);
    result[hour_of_entry].hits += 1;
  });

  return result;
}

function group_by_day(data) {
  //return _group_by(data, 32, "YYYY MM DD")
  let result = [];

  data.forEach(entry => {

    let entry_interval = moment.unix(entry.instant).format("YYYY MM DD");
    if(result[entry_interval]) {
        result[entry_interval].value += 1;
    }
    else {
        result[entry_interval] = {interval: entry_interval, value: 1}
    }
  });

  return Object.values(result);
}

// data: Entry[] where every entry belong to the same day
function group_by_hour(data) {
  return _group_by(data, 24, "HH");
}

// data: Entry[] where every entry belong to the same day and hour
function group_by_minute(data) {
  return _group_by(data, 60, "mm");
}

function filter_by_day(data, requested_day) {
  let result = [];

  data.forEach(entry => {
    let day = moment.unix(entry.instant).format("YYYY MM DD");
    if(day === requested_day) {
        result.push(entry);
    }
  });

  return result;
}

// @Assumption: records inside `data` are sorted by instant in ascending order
function merge_consecutive_entries(data) {
    return data.reduce((prev, entry) => {
        if (prev.length === 0) return [entry];

        const last_pos = prev.length - 1;
        if (prev[last_pos].on_off !== entry.on_off) {
            prev.push(entry);
        }
        return prev;
    }, []);
}

function fix_data(data) {
    let sorted_data = data.sort((a_rec, b_rec) => a_rec.instant - b_rec.instant);

    let merged_data = merge_consecutive_entries(sorted_data);

    // group entries by day
    let grouped_by_day = {};
    merged_data.forEach(entry => {
        let day = moment.unix(entry.instant).format("YYYY MM DD");
        if (grouped_by_day[day]) {
            grouped_by_day[day].push(entry);
        }
        else {
            grouped_by_day[day] = [entry];
        }
    });

    // add entries at midnight (end of day)
    let days = Object.keys(grouped_by_day).sort();
    days.forEach((day, i) => {
        // skip startOfDay if first entry is already at start of day
        let today_entries = grouped_by_day[day];
        let first_entry = today_entries[0];
        const skipStartOfDay = (first_entry && first_entry.instant === moment(day, "YYYY MM DD").startOf("day").valueOf()/1000);

        // not using moment.utc here because timestamps on server are not utc
        if(i > 0 && !skipStartOfDay) {
            let entries = grouped_by_day[days[i-1]];
            let last_entry_of_yesterday = entries[entries.length - 1];
            grouped_by_day[day].splice(0, 0, {
                instant: moment(day, "YYYY MM DD").startOf("day").valueOf() / 1000,
                on_off: last_entry_of_yesterday.on_off,
                new_: true
            });
        }
        if (i < days.length-1) {
            let entries = grouped_by_day[day];
            let last_entry_of_today = entries[entries.length - 1];
            grouped_by_day[day].push({
                instant: moment(day, "YYYY MM DD").endOf("day").valueOf() / 1000,
                on_off: last_entry_of_today.on_off,
                new_: true
            });
        }
    });

    // flatten
    return Object.values(grouped_by_day).reduce((result, entries) => result.concat(entries), []);
}

function duration_distribution(single_day_data) {
  let cache = {};
  let currentTotal = 0;
  let last_entry = null;
  single_day_data.forEach(entry => {
    if(turned_off(entry.on_off)) {
	if(last_entry !== null) {
	  const delta = Math.round(entry.instant - last_entry.instant);
          if(cache[delta] !== undefined) {
              cache[delta] += 1;
	  }
          else {
	      cache[delta] = 1;
	  }
	}
    }
    last_entry = entry;
  });

  let distribution = [];
  let sorted_durations = Object.keys(cache).sort();
  sorted_durations.forEach(delta => {
    distribution.push({delta, hits: cache[delta]});
  });
  return distribution;
}
