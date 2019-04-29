export function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
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
  }
  return getValue(streamOrStreams);
}
