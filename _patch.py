import re
p = "src/module_collector.ts"
s = open(p).read()
old = '''  return Promise.all(modules);
}'''
new = '''  const editableModules = await Promise.all(modules);
  // Sort by module path so that the compilation (and therefore the order of
  // modules, records and aggregated errors) does not depend on the order in
  // which the file system enumerates files.
  return [...editableModules].sort((a, b) =>
    a.modulePath < b.modulePath ? -1 : a.modulePath > b.modulePath ? 1 : 0,
  );
}'''
assert old in s
s = s.replace(old, new, 1)
open(p, "w").write(s)
