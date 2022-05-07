import  xml from '../src/xml'

console.log(xml([{a: { } }]))
console.log(xml([{a: [{b: [{c: 1}, {c: 2}, {c: 3}]}]}], true))