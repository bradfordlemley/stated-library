export function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

export function isObservable(o) {
  return typeof o.subscribe === 'function';
}

export function getValue(value$) {
  if (value$.hasOwnProperty('value')) {
    return value$.value;
  }
  let initialValue = undefined;
  const sub = value$.subscribe(v => (initialValue = v));
  sub.unsubscribe();
  return initialValue;
}

export function getValueOrValues(streamOrStreams) {
  if (isArray(streamOrStreams)) {
    const values = [];
    streamOrStreams.map((s, i) => {
      values[i] = getValue(s);
    });
    return values;
  } else if (isObservable(streamOrStreams)) {
    return getValue(streamOrStreams);
  } else {
    return Object.keys(streamOrStreams).reduce((result, key) => {
      result[key] = getValue(streamOrStreams[key]);
      return result;
    }, {});
  }
}
