export const packer = {
    "SingleOperator": elems => [elems.join('')],
    "DoubleOperator": elems => [elems.join('')],
    "TribleOperator": elems => [elems.join('')],
    "SubExpression": ([ , expr]) =>
        [expr],
    "SingleEval": ([opt, item]) =>
        [[opt, item]],
    "DoubleEval": ([item1, opt, item2]) =>
        [[opt, item1, item2]],
    "TribleEval": ([opt, item1, item2, item3]) =>
        [[opt, item1, item2, item3]],
    "~Args": elems => [elems],
    "FullDefine": ([name, , args, , , expr]) =>
        [["func", name, ["raw", ...args], ["raw", ...expr]]],
    "PartDefine": ([name, , expr]) =>
        [["func", name, [], ["raw", ...expr]]],
    "Call": elems =>
        [["call", elems[0], ...elems.slice(2, elems.length - 1)]],
    "Command": elems => [[elems[1], ...elems.slice(3, elems.length - 1)]],
    "List": elems => [elems.slice(1, elems.length - 1)],
    "Vector": elems => [elems.filter(e => typeof e === "number")],
    "Whitespace": elems => [],
    "Token": elems => [elems.join('')],
    "Number": elems => [Number.parseFloat(elems.join(''))],
    "Comment": elems => [],
    "Root": elems => elems.filter(e => e !== ';'),
};
