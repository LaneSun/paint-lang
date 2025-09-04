import {init_converter, load_cmrule, load_text} from "./chelonia/utils.js";
import {parser} from "./chelonia/parser.js";

let edit_width = getComputedStyle(document.getElementById("code")).width;
const editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    matchBrackets: true,
    mode: {name: "javascript", json: true},
    extraKeys: {"Ctrl-S": run_editor},
});
editor.display.wrapper.style.width = edit_width;
const but_run = document.getElementById("but-run");

const canvas = document.getElementById("output");
const context = canvas.getContext("2d");
const size = canvas.width;

function clear() {
    context.fillStyle = "#f4f4f4";
    context.fillRect(0, 0, size, size);
    context.fillStyle = "#000000";
    context.strokeStyle = "#000000";
}

function normalize(vec) {
    return vec.map(v => v * size);
}

function draw_dot(point) {
    const [x, y] = normalize(point);
    context.fillRect(x - 1, size - (y - 1), 2, -2);
}

function draw_line(points) {
    points = points.map(p => normalize(p));
    context.beginPath();
    context.moveTo(points[0][0], size - points[0][1]);
    points.slice(1).forEach(([x, y]) => {
        context.lineTo(x, size - y);
    });
    context.stroke();
}

let env = [new Map()];

function add_env(name, value) {
    env[env.length - 1].set(name, value);
}

function get_env(name, index = env.length - 1) {
    if (index < 0) {
        debugger;
        throw new Error("env " + name + " not found");
    }
    if (env[index].has(name)) return env[index].get(name);
    return get_env(name, index - 1);
}

const MACROS = {
    "raw": (...args) => args,
    "#if": (cond, expr1, expr2) => {
        if (eval_list(cond)) {
            const res = eval_list(expr1);
            return res;
        }
        else return eval_list(expr2);
    },
};

const ACTIONS = {
    "clear": () => clear(),
    "dot": (points) => {
        for (const point of points) draw_dot(point);
    },
    "line": (lines) => {
        console.log(lines);
        for (const line of lines) draw_line(line);
    },
    "func": (name, args, expr) => {
        add_env(name, [args, expr]);
    },
    "call": (name, ...args) => {
        const [avgs, expr] = get_env(name);
        if (avgs.length === 0) {
            return eval_list(expr);
        } else {
            env.push(new Map());
            args.forEach((value, index) => {
                add_env(avgs[index], [[], value]);
            });
            const res = eval_list(expr);
            env.pop();
            return res;
        }
    },
    "!": (a) => !a ? 1 : 0,
    "+": (a, b = 0) => a + b,
    "-": (a, b) => b === undefined ? -a : a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => a / b,
    "^": (a, b) => a ** b,
    "%": (a, b) => a % b,
    "#": (a, b) => a.concat(b),
    "<": (a, b) => a < b ? 1 : 0,
    ">": (a, b) => a > b ? 1 : 0,
    "&": (a, b) => a && b ? 1 : 0,
    "|": (a, b) => a || b ? 1 : 0,
    "<=": (a, b) => a <= b ? 1 : 0,
    ">=": (a, b) => a >= b ? 1 : 0,
    "cos": (a) => Math.cos(a),
    "sin": (a) => Math.sin(a),
    "log": (a) => Math.log(a),
    "pi": () => Math.PI,
    "tau": () => Math.PI * 2,
};

function eval_list(list) {
    if (typeof list !== "object") return list;
    if (list.length === 0) return [];
    if (typeof list[0] === "string") {
        if (MACROS[list[0]])
            return MACROS[list[0]].apply(null, list.slice(1));
        if (ACTIONS[list[0]])
            return ACTIONS[list[0]].apply(null, list.slice(1).map(e => eval_list(e)));
        throw "action " + list[0] + " not found";
    }
    return list.map(e => eval_list(e));
}

function run_list(list) {
    env = [new Map()];
    for (const l of list) {
        const res = eval_list(l);
        if (res) console.log(res);
    }
}

await init_converter();
const rule = await load_cmrule("./rules/paint-lang");

function run_editor() {
    const source = editor.getValue();
    const res = parser(rule, source.split(''));
    console.log(res);
    run_list(res);
}
window.run_editor = run_editor;

but_run.classList.remove("disable");
clear();

run_editor();
