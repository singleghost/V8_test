'use strict';

let spectest = {
  print: print || ((...xs) => console.log(...xs)),
  global: 666,
  table: new WebAssembly.Table({initial: 10, maximum: 20, element: 'anyfunc'}),  memory: new WebAssembly.Memory({initial: 1, maximum: 2}),};

let registry = {spectest};

function register(name, instance) {
  registry[name] = instance.exports;
}

function module(bytes, valid = true) {
  let buffer = new ArrayBuffer(bytes.length);
  let view = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; ++i) {
    view[i] = bytes.charCodeAt(i);
  }
  let validated;
  try {
    validated = WebAssembly.validate(buffer);
  } catch (e) {
    throw new Error("Wasm validate throws");
  }
  if (validated !== valid) {
    throw new Error("Wasm validate failure" + (valid ? "" : " expected"));
  }
  return new WebAssembly.Module(buffer);
}

function instance(bytes, imports = registry) {
  return new WebAssembly.Instance(module(bytes), imports);
}

function call(instance, name, args) {
  return instance.exports[name](...args);
}

function get(instance, name) {
  return instance.exports[name];
}

function exports(name, instance) {
  return {[name]: instance.exports};
}

function run(action) {
  action();
}

function assert_malformed(bytes) {
  try { module(bytes, false) } catch (e) {
    if (e instanceof WebAssembly.CompileError) return;
  }
  throw new Error("Wasm decoding failure expected");
}

function assert_invalid(bytes) {
  try { module(bytes, false) } catch (e) {
    if (e instanceof WebAssembly.CompileError) return;
  }
  throw new Error("Wasm validation failure expected");
}

function assert_unlinkable(bytes) {
  let mod = module(bytes);
  try { new WebAssembly.Instance(mod, registry) } catch (e) {
    if (e instanceof WebAssembly.LinkError) return;
  }
  throw new Error("Wasm linking failure expected");
}

function assert_uninstantiable(bytes) {
  let mod = module(bytes);
  try { new WebAssembly.Instance(mod, registry) } catch (e) {
    if (e instanceof WebAssembly.RuntimeError) return;
  }
  throw new Error("Wasm trap expected");
}

function assert_trap(action) {
  try { action() } catch (e) {
    if (e instanceof WebAssembly.RuntimeError) return;
  }
  throw new Error("Wasm trap expected");
}

let StackOverflow;
try { (function f() { 1 + f() })() } catch (e) { StackOverflow = e.constructor }

function assert_exhaustion(action) {
  try { action() } catch (e) {
    if (e instanceof StackOverflow) return;
  }
  throw new Error("Wasm resource exhaustion expected");
}

function assert_return(action, expected) {
  let actual = action();
  if (!Object.is(actual, expected)) {
    throw new Error("Wasm return value " + expected + " expected, got " + actual);
  };
}

function assert_return_canonical_nan(action) {
  let actual = action();
  // Note that JS can't reliably distinguish different NaN values,
  // so there's no good way to test that it's a canonical NaN.
  if (!Number.isNaN(actual)) {
    throw new Error("Wasm return value NaN expected, got " + actual);
  };
}

function assert_return_arithmetic_nan(action) {
  // Note that JS can't reliably distinguish different NaN values,
  // so there's no good way to test for specific bitpatterns here.
  let actual = action();
  if (!Number.isNaN(actual)) {
    throw new Error("Wasm return value NaN expected, got " + actual);
  };
}


// get_local.wast:3
let $1 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\xb6\x80\x80\x80\x00\x0a\x60\x00\x01\x7f\x60\x00\x01\x7e\x60\x00\x01\x7d\x60\x00\x01\x7c\x60\x01\x7f\x01\x7f\x60\x01\x7e\x01\x7e\x60\x01\x7d\x01\x7d\x60\x01\x7c\x01\x7c\x60\x05\x7e\x7d\x7c\x7f\x7f\x00\x60\x05\x7e\x7d\x7c\x7f\x7f\x01\x7c\x03\x8b\x80\x80\x80\x00\x0a\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x07\x9d\x81\x80\x80\x00\x0a\x0e\x74\x79\x70\x65\x2d\x6c\x6f\x63\x61\x6c\x2d\x69\x33\x32\x00\x00\x0e\x74\x79\x70\x65\x2d\x6c\x6f\x63\x61\x6c\x2d\x69\x36\x34\x00\x01\x0e\x74\x79\x70\x65\x2d\x6c\x6f\x63\x61\x6c\x2d\x66\x33\x32\x00\x02\x0e\x74\x79\x70\x65\x2d\x6c\x6f\x63\x61\x6c\x2d\x66\x36\x34\x00\x03\x0e\x74\x79\x70\x65\x2d\x70\x61\x72\x61\x6d\x2d\x69\x33\x32\x00\x04\x0e\x74\x79\x70\x65\x2d\x70\x61\x72\x61\x6d\x2d\x69\x36\x34\x00\x05\x0e\x74\x79\x70\x65\x2d\x70\x61\x72\x61\x6d\x2d\x66\x33\x32\x00\x06\x0e\x74\x79\x70\x65\x2d\x70\x61\x72\x61\x6d\x2d\x66\x36\x34\x00\x07\x0a\x74\x79\x70\x65\x2d\x6d\x69\x78\x65\x64\x00\x08\x04\x72\x65\x61\x64\x00\x09\x0a\xc6\x81\x80\x80\x00\x0a\x86\x80\x80\x80\x00\x01\x01\x7f\x20\x00\x0b\x86\x80\x80\x80\x00\x01\x01\x7e\x20\x00\x0b\x86\x80\x80\x80\x00\x01\x01\x7d\x20\x00\x0b\x86\x80\x80\x80\x00\x01\x01\x7c\x20\x00\x0b\x84\x80\x80\x80\x00\x00\x20\x00\x0b\x84\x80\x80\x80\x00\x00\x20\x00\x0b\x84\x80\x80\x80\x00\x00\x20\x00\x0b\x84\x80\x80\x80\x00\x00\x20\x00\x0b\xac\x80\x80\x80\x00\x03\x01\x7d\x02\x7e\x01\x7c\x20\x00\x50\x1a\x20\x01\x8c\x1a\x20\x02\x9a\x1a\x20\x03\x45\x1a\x20\x04\x45\x1a\x20\x05\x8c\x1a\x20\x06\x50\x1a\x20\x07\x50\x1a\x20\x08\x9a\x1a\x0b\xbf\x80\x80\x80\x00\x03\x01\x7d\x02\x7e\x01\x7c\x43\x00\x00\xb0\x40\x21\x05\x42\x06\x21\x06\x44\x00\x00\x00\x00\x00\x00\x20\x40\x21\x08\x20\x00\xba\x20\x01\xbb\x20\x02\x20\x03\xb8\x20\x04\xb7\x20\x05\xbb\x20\x06\xba\x20\x07\xba\x20\x08\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\x0b");

// get_local.wast:64
assert_return(() => call($1, "type-local-i32", []), 0);

// get_local.wast:65
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x88\x80\x80\x80\x00\x02\x60\x00\x00\x60\x00\x01\x7e\x02\x95\x80\x80\x80\x00\x01\x02\x24\x31\x0e\x74\x79\x70\x65\x2d\x6c\x6f\x63\x61\x6c\x2d\x69\x36\x34\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\x97\x80\x80\x80\x00\x01\x91\x80\x80\x80\x00\x00\x02\x40\x10\x00\x01\x42\x00\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$1", $1)),  "run", []));  // assert_return(() => call($1, "type-local-i64", []), int64("0"))

// get_local.wast:66
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x88\x80\x80\x80\x00\x02\x60\x00\x00\x60\x00\x01\x7d\x02\x95\x80\x80\x80\x00\x01\x02\x24\x31\x0e\x74\x79\x70\x65\x2d\x6c\x6f\x63\x61\x6c\x2d\x66\x33\x32\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\x9a\x80\x80\x80\x00\x01\x94\x80\x80\x80\x00\x00\x02\x40\x10\x00\xbc\x43\x00\x00\x00\x00\xbc\x46\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$1", $1)),  "run", []));  // assert_return(() => call($1, "type-local-f32", []), 0.)

// get_local.wast:67
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x88\x80\x80\x80\x00\x02\x60\x00\x00\x60\x00\x01\x7c\x02\x95\x80\x80\x80\x00\x01\x02\x24\x31\x0e\x74\x79\x70\x65\x2d\x6c\x6f\x63\x61\x6c\x2d\x66\x36\x34\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\x9e\x80\x80\x80\x00\x01\x98\x80\x80\x80\x00\x00\x02\x40\x10\x00\xbd\x44\x00\x00\x00\x00\x00\x00\x00\x00\xbd\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$1", $1)),  "run", []));  // assert_return(() => call($1, "type-local-f64", []), 0.)

// get_local.wast:69
assert_return(() => call($1, "type-param-i32", [2]), 2);

// get_local.wast:70
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x95\x80\x80\x80\x00\x01\x02\x24\x31\x0e\x74\x79\x70\x65\x2d\x70\x61\x72\x61\x6d\x2d\x69\x36\x34\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\x99\x80\x80\x80\x00\x01\x93\x80\x80\x80\x00\x00\x02\x40\x42\x03\x10\x00\x01\x42\x03\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$1", $1)),  "run", []));  // assert_return(() => call($1, "type-param-i64", [int64("3")]), int64("3"))

// get_local.wast:71
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7d\x01\x7d\x02\x95\x80\x80\x80\x00\x01\x02\x24\x31\x0e\x74\x79\x70\x65\x2d\x70\x61\x72\x61\x6d\x2d\x66\x33\x32\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\x9f\x80\x80\x80\x00\x01\x99\x80\x80\x80\x00\x00\x02\x40\x43\xcd\xcc\x8c\x40\x10\x00\xbc\x43\xcd\xcc\x8c\x40\xbc\x46\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$1", $1)),  "run", []));  // assert_return(() => call($1, "type-param-f32", [4.40000009537]), 4.40000009537)

// get_local.wast:72
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7c\x01\x7c\x02\x95\x80\x80\x80\x00\x01\x02\x24\x31\x0e\x74\x79\x70\x65\x2d\x70\x61\x72\x61\x6d\x2d\x66\x36\x34\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\xa7\x80\x80\x80\x00\x01\xa1\x80\x80\x80\x00\x00\x02\x40\x44\x00\x00\x00\x00\x00\x00\x16\x40\x10\x00\xbd\x44\x00\x00\x00\x00\x00\x00\x16\x40\xbd\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$1", $1)),  "run", []));  // assert_return(() => call($1, "type-param-f64", [5.5]), 5.5)

// get_local.wast:74
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x8c\x80\x80\x80\x00\x02\x60\x00\x00\x60\x05\x7e\x7d\x7c\x7f\x7f\x00\x02\x91\x80\x80\x80\x00\x01\x02\x24\x31\x0a\x74\x79\x70\x65\x2d\x6d\x69\x78\x65\x64\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\xa3\x80\x80\x80\x00\x01\x9d\x80\x80\x80\x00\x00\x02\x40\x42\x01\x43\xcd\xcc\x0c\x40\x44\x66\x66\x66\x66\x66\x66\x0a\x40\x41\x04\x41\x05\x10\x00\x0f\x0b\x00\x0b", exports("$1", $1)),  "run", []));  // assert_return(() => call($1, "type-mixed", [int64("1"), 2.20000004768, 3.3, 4, 5]))

// get_local.wast:80
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x8d\x80\x80\x80\x00\x02\x60\x00\x00\x60\x05\x7e\x7d\x7c\x7f\x7f\x01\x7c\x02\x8b\x80\x80\x80\x00\x01\x02\x24\x31\x04\x72\x65\x61\x64\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\xb2\x80\x80\x80\x00\x01\xac\x80\x80\x80\x00\x00\x02\x40\x42\x01\x43\x00\x00\x00\x40\x44\x66\x66\x66\x66\x66\x66\x0a\x40\x41\x04\x41\x05\x10\x00\xbd\x44\x66\x66\x66\x66\x66\x66\x41\x40\xbd\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$1", $1)),  "run", []));  // assert_return(() => call($1, "read", [int64("1"), 2., 3.3, 4, 5]), 34.8)

// get_local.wast:90
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x85\x80\x80\x80\x00\x01\x60\x00\x01\x7e\x03\x82\x80\x80\x80\x00\x01\x00\x0a\x8c\x80\x80\x80\x00\x01\x86\x80\x80\x80\x00\x01\x01\x7f\x20\x00\x0b");

// get_local.wast:94
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x84\x80\x80\x80\x00\x01\x60\x00\x00\x03\x82\x80\x80\x80\x00\x01\x00\x0a\x8d\x80\x80\x80\x00\x01\x87\x80\x80\x80\x00\x01\x01\x7d\x20\x00\x45\x0b");

// get_local.wast:98
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x84\x80\x80\x80\x00\x01\x60\x00\x00\x03\x82\x80\x80\x80\x00\x01\x00\x0a\x8f\x80\x80\x80\x00\x01\x89\x80\x80\x80\x00\x02\x01\x7c\x01\x7e\x20\x01\x9a\x0b");

// get_local.wast:106
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x86\x80\x80\x80\x00\x01\x60\x01\x7f\x01\x7e\x03\x82\x80\x80\x80\x00\x01\x00\x0a\x8a\x80\x80\x80\x00\x01\x84\x80\x80\x80\x00\x00\x20\x00\x0b");

// get_local.wast:110
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x85\x80\x80\x80\x00\x01\x60\x01\x7d\x00\x03\x82\x80\x80\x80\x00\x01\x00\x0a\x8b\x80\x80\x80\x00\x01\x85\x80\x80\x80\x00\x00\x20\x00\x45\x0b");

// get_local.wast:114
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x86\x80\x80\x80\x00\x01\x60\x02\x7c\x7e\x00\x03\x82\x80\x80\x80\x00\x01\x00\x0a\x8b\x80\x80\x80\x00\x01\x85\x80\x80\x80\x00\x00\x20\x01\x9a\x0b");

// get_local.wast:122
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x84\x80\x80\x80\x00\x01\x60\x00\x00\x03\x82\x80\x80\x80\x00\x01\x00\x0a\x8e\x80\x80\x80\x00\x01\x88\x80\x80\x80\x00\x02\x01\x7f\x01\x7e\x20\x03\x0b");

// get_local.wast:126
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x84\x80\x80\x80\x00\x01\x60\x00\x00\x03\x82\x80\x80\x80\x00\x01\x00\x0a\x91\x80\x80\x80\x00\x01\x8b\x80\x80\x80\x00\x02\x01\x7f\x01\x7e\x20\xf7\xa4\xea\x06\x0b");

// get_local.wast:131
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x86\x80\x80\x80\x00\x01\x60\x02\x7f\x7e\x00\x03\x82\x80\x80\x80\x00\x01\x00\x0a\x8a\x80\x80\x80\x00\x01\x84\x80\x80\x80\x00\x00\x20\x02\x0b");

// get_local.wast:135
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x84\x80\x80\x80\x00\x01\x60\x00\x00\x03\x82\x80\x80\x80\x00\x01\x00\x0a\x92\x80\x80\x80\x00\x01\x8c\x80\x80\x80\x00\x02\x01\x7f\x01\x7e\x20\xf7\xf2\xce\xd4\x02\x0b");

// get_local.wast:140
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x85\x80\x80\x80\x00\x01\x60\x01\x7f\x00\x03\x82\x80\x80\x80\x00\x01\x00\x0a\x8e\x80\x80\x80\x00\x01\x88\x80\x80\x80\x00\x02\x01\x7f\x01\x7e\x20\x03\x0b");

// get_local.wast:144
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x85\x80\x80\x80\x00\x01\x60\x01\x7e\x00\x03\x82\x80\x80\x80\x00\x01\x00\x0a\x91\x80\x80\x80\x00\x01\x8b\x80\x80\x80\x00\x02\x01\x7f\x01\x7e\x20\xf7\xa8\x99\x66\x0b");
