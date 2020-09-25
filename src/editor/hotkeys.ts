import { BabylonLoader } from "./middleware/loader/babylonLoader";

export class Hotkeys {

    public static ctrl: boolean = false;
    public static shift: boolean = false;
    public static alt: boolean = false;

    private hotkeys: { [key: string]: HotKeyArgs } = {};
    private keyIndex: { [key: string]: string[] } = {};
    // private keysDown = {};

    private isMac: boolean = navigator.userAgent.indexOf('Mac OS X') !== -1;

    private keyByKeyCode: { [key: number]: string } = {};
    private keyByCode: { [key: string]: string } = {};

    private keyMap: { [key: string]: { keyCode: number, code: string | string[] } } = {};

    public constructor() {
        this.keyMapInit();

        let self = this;

        editor.method('hotkey:register', function (name: string, args: HotKeyArgs) {
            self.hotkeys[name] = args;

            // keys list
            let keys: string[] = [args.ctrl ? '1' : '0', args.alt ? '1' : '0', args.shift ? '1' : '0'];

            // map keyCode to key
            if (typeof (args.key) === 'number')
                args.key = self.keyByKeyCode[args.key];

            // unknown key
            if (!args.key) {
                console.error('未知的hotkeys: ' + name + ', ' + args.key);
                return;
            }

            keys.push(args.key);

            args.index = keys.join('+');

            if (!self.keyIndex[args.index])
                self.keyIndex[args.index] = [];

            self.keyIndex[args.index].push(name);
        });

        editor.method('hotkey:unregister', function (name: string) {
            let hotkey: HotKeyArgs = self.hotkeys[name];
            if (!hotkey) return;

            if (self.keyIndex[hotkey.index!].length === 1) {
                delete self.keyIndex[hotkey.index!];
            } else {
                self.keyIndex[hotkey.index!].splice(self.keyIndex[hotkey.index!].indexOf(name), 1);
            }

            delete self.hotkeys[name];
        });


        editor.method('hotkey:shift', function () {
            return Hotkeys.shift;
        });

        editor.method('hotkey:ctrl', function () {
            return Hotkeys.ctrl;
        });

        editor.method('hotkey:alt', function () {
            return Hotkeys.alt;
        });

        let updateModifierKeys: (evt: Event) => void = function (evt: Event): void {
            if (evt instanceof KeyboardEvent || evt instanceof MouseEvent) {
                // console.warn(evt);
                Hotkeys.shift = evt.shiftKey;
                Hotkeys.ctrl = evt.ctrlKey || evt.metaKey;
                Hotkeys.alt = evt.altKey;
            }
        };
        editor.method('hotkey:updateModifierKeys', updateModifierKeys);

        window.addEventListener('keydown', function (evt: KeyboardEvent) {
            if (evt.target) {
                let tag: string = (<HTMLElement>evt.target).tagName;
                if (/(input)|(textarea)/i.test(tag) && !(<HTMLElement>evt.target).classList.contains('hotkeys'))
                    return;
            }

            updateModifierKeys(evt);

            let key: string = evt.code ? self.keyByCode[evt.code] : self.keyByKeyCode[evt.keyCode];

            if (evt.keyCode === 92 || evt.keyCode === 93)
                return;

            let index: string = [Hotkeys.ctrl ? '1' : '0', Hotkeys.alt ? '1' : '0', Hotkeys.shift ? '1' : '0', key].join('+');

            if (self.keyIndex[index]) {
                let skipPreventDefault: boolean = false;
                for (let i: number = 0; i < self.keyIndex[index].length; i++) {
                    if (!skipPreventDefault && self.hotkeys[self.keyIndex[index][i]].skipPreventDefault)
                        skipPreventDefault = true;

                    self.hotkeys[self.keyIndex[index][i]].callback(evt);
                }
                if (!skipPreventDefault)
                    evt.preventDefault();
            }
        }, false);

        // Returns Ctrl or Cmd for Mac
        editor.method('hotkey:ctrl:string', function () {
            return self.isMac ? 'Cmd' : 'Ctrl';
        });


        window.addEventListener('keyup', updateModifierKeys, false);
        window.addEventListener('mousedown', updateModifierKeys, false);
        window.addEventListener('mouseup', updateModifierKeys, false);
        window.addEventListener('click', updateModifierKeys, false);

        // save scene
        editor.call('hotkey:register', 'save:scene', {
            key: 's',
            ctrl: true,
            callback: function () {
                editor.call('save:scene');
            }
        });

    }


    private keyMapInit(): void {
        this.keyMap = {
            'backspace': {
                keyCode: 8,
                code: 'Backspace'
            },
            'tab': {
                keyCode: 9,
                code: 'Tab',
            },
            'enter': {
                keyCode: 13,
                code: ['enter', 'NumpadEnter', 'Enter'],
            },
            'shift': {
                keyCode: 16,
                code: ['ShiftLeft', 'ShiftRight'],
            },
            'ctrl': {
                keyCode: 17,
                code: ['CtrlLeft', 'CtrlRight'],
            },
            'alt': {
                keyCode: 18,
                code: ['AltLeft', 'AltRight'],
            },
            'pause/break': {
                keyCode: 19,
                code: 'Pause',
            },
            'caps lock': {
                keyCode: 20,
                code: 'CapsLock',
            },
            'esc': {
                keyCode: 27,
                code: 'Escape',
            },
            'space': {
                keyCode: 32,
                code: 'Space',
            },
            'page up': {
                keyCode: 33,
                code: 'PageUp'
            },
            'page down': {
                keyCode: 34,
                code: 'PageDown'
            },
            'end': {
                keyCode: 35,
                code: 'End'
            },
            'home': {
                keyCode: 36,
                code: 'Home'
            },
            'left arrow': {
                keyCode: 37,
                code: 'ArrowLeft'
            },
            'up arrow': {
                keyCode: 38,
                code: 'ArrowUp'
            },
            'right arrow': {
                keyCode: 39,
                code: 'ArrowRight'
            },
            'down arrow': {
                keyCode: 40,
                code: 'ArrowDown'
            },
            'insert': {
                keyCode: 45,
                code: 'Insert'
            },
            'delete': {
                keyCode: 46,
                code: 'Delete'
            },
            '0': {
                keyCode: 48,
                code: 'Digit0'
            },
            '1': {
                keyCode: 49,
                code: 'Digit1'
            },
            '2': {
                keyCode: 50,
                code: 'Digit2'
            },
            '3': {
                keyCode: 51,
                code: 'Digit3'
            },
            '4': {
                keyCode: 52,
                code: 'Digit4'
            },
            '5': {
                keyCode: 53,
                code: 'Digit5'
            },
            '6': {
                keyCode: 54,
                code: 'Digit6'
            },
            '7': {
                keyCode: 55,
                code: 'Digit7'
            },
            '8': {
                keyCode: 56,
                code: 'Digit8'
            },
            '9': {
                keyCode: 57,
                code: 'Digit9'
            },
            'a': {
                keyCode: 65,
                code: 'KeyA'
            },
            'b': {
                keyCode: 66,
                code: 'KeyB'
            },
            'c': {
                keyCode: 67,
                code: 'KeyC'
            },
            'd': {
                keyCode: 68,
                code: 'KeyD'
            },
            'e': {
                keyCode: 69,
                code: 'KeyE'
            },
            'f': {
                keyCode: 70,
                code: 'KeyF'
            },
            'g': {
                keyCode: 71,
                code: 'KeyG'
            },
            'h': {
                keyCode: 72,
                code: 'KeyH'
            },
            'i': {
                keyCode: 73,
                code: 'KeyI'
            },
            'j': {
                keyCode: 74,
                code: 'KeyJ'
            },
            'k': {
                keyCode: 75,
                code: 'KeyK'
            },
            'l': {
                keyCode: 76,
                code: 'KeyL'
            },
            'm': {
                keyCode: 77,
                code: 'KeyM'
            },
            'n': {
                keyCode: 78,
                code: 'KeyN'
            },
            'o': {
                keyCode: 79,
                code: 'KeyO'
            },
            'p': {
                keyCode: 80,
                code: 'KeyP'
            },
            'q': {
                keyCode: 81,
                code: 'KeyQ'
            },
            'r': {
                keyCode: 82,
                code: 'KeyR'
            },
            's': {
                keyCode: 83,
                code: 'KeyS'
            },
            't': {
                keyCode: 84,
                code: 'KeyT'
            },
            'u': {
                keyCode: 85,
                code: 'KeyU'
            },
            'v': {
                keyCode: 86,
                code: 'KeyV'
            },
            'w': {
                keyCode: 87,
                code: 'KeyW'
            },
            'x': {
                keyCode: 88,
                code: 'KeyX'
            },
            'y': {
                keyCode: 89,
                code: 'KeyY'
            },
            'z': {
                keyCode: 90,
                code: 'KeyZ'
            },
            'left window key': {
                keyCode: 91,
                code: 'MetaLeft'
            },
            'right window key': {
                keyCode: 92,
                code: 'MetaRight'
            },
            'select key': {
                keyCode: 93,
                code: 'ContextMenu'
            },
            'numpad 0': {
                keyCode: 96,
                code: 'Numpad0'
            },
            'numpad 1': {
                keyCode: 97,
                code: 'Numpad1'
            },
            'numpad 2': {
                keyCode: 98,
                code: 'Numpad2'
            },
            'numpad 3': {
                keyCode: 99,
                code: 'Numpad3'
            },
            'numpad 4': {
                keyCode: 100,
                code: 'Numpad4'
            },
            'numpad 5': {
                keyCode: 101,
                code: 'Numpad5'
            },
            'numpad 6': {
                keyCode: 102,
                code: 'Numpad6'
            },
            'numpad 7': {
                keyCode: 103,
                code: 'Numpad7'
            },
            'numpad 8': {
                keyCode: 104,
                code: 'Numpad8'
            },
            'numpad 9': {
                keyCode: 105,
                code: 'Numpad9'
            },
            'multiply': {
                keyCode: 106,
                code: 'NumpadMultiply'
            },
            'add': {
                keyCode: 107,
                code: 'NumpadAdd'
            },
            'subtract': {
                keyCode: 109,
                code: 'NumpadSubtract'
            },
            'decimal point': {
                keyCode: 110,
                code: 'NumpadDecimal'
            },
            'divide': {
                keyCode: 111,
                code: 'NumpadDivide'
            },
            'f1': {
                keyCode: 112,
                code: 'F1'
            },
            'f2': {
                keyCode: 113,
                code: 'F2'
            },
            'f3': {
                keyCode: 114,
                code: 'F3'
            },
            'f4': {
                keyCode: 115,
                code: 'F4'
            },
            'f5': {
                keyCode: 116,
                code: 'F5'
            },
            'f6': {
                keyCode: 117,
                code: 'F6'
            },
            'f7': {
                keyCode: 118,
                code: 'F7'
            },
            'f8': {
                keyCode: 119,
                code: 'F8'
            },
            'f9': {
                keyCode: 120,
                code: 'F9'
            },
            'f10': {
                keyCode: 121,
                code: 'F10'
            },
            'f11': {
                keyCode: 122,
                code: 'F11'
            },
            'f12': {
                keyCode: 123,
                code: 'F12'
            },
            'num lock': {
                keyCode: 144,
                code: 'NumLock'
            },
            'scroll lock': {
                keyCode: 145,
                code: 'ScrollLock'
            },
            'semi-colon': {
                keyCode: 186,
                code: 'Semicolon'
            },
            'equal sign': {
                keyCode: 187,
                code: 'Equal'
            },
            'comma': {
                keyCode: 188,
                code: 'Comma'
            },
            'dash': {
                keyCode: 189,
                code: 'Minus'
            },
            'period': {
                keyCode: 190,
                code: 'Period'
            },
            'forward slash': {
                keyCode: 191,
                code: ''
            },
            'grave accent': {
                keyCode: 192,
                code: 'Backquote'
            },
            'open bracket': {
                keyCode: 219,
                code: 'BracketLeft'
            },
            'back slash': {
                keyCode: 220,
                code: ['Backslash', 'IntlBackslash']
            },
            'close bracket': {
                keyCode: 221,
                code: 'BracketRight'
            },
            'single quote': {
                keyCode: 222,
                code: 'Quote'
            },
        };

        for (let key in this.keyMap) {
            this.keyByKeyCode[this.keyMap[key].keyCode] = key;

            if (this.keyMap[key].code instanceof Array) {
                for (let i: number = 0; i < this.keyMap[key].code.length; i++) {
                    this.keyByCode[this.keyMap[key].code[i]] = key;
                }
            } else {
                this.keyByCode[<string>(this.keyMap[key].code)] = key;
            }
        }

    }



}


export interface HotKeyArgs {
    key: string | number;
    callback: (evt?: Event) => void;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    skipPreventDefault?: boolean;
    index?: string
}