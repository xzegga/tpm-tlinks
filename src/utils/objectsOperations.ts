export function getProperty(obj: any, propertyString: string): any {
  if (!obj || !propertyString) return undefined;
  const properties: string[] = propertyString.split('.');
  let value: any = obj;
  for (const prop of properties) {
    value = value[prop];
    if (value === undefined) {
      return undefined;
    }
  }
  return {
    name: properties[0],
    value,
  };
}
