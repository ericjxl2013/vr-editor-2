import { Element } from "./element";

export class ColorField extends Element {

    public elementColor: HTMLElement;

    private _values: number[];

    public evtLinkChannels: EventHandle[];

    private _channels: number;
    public get channels(): number {
        return this._channels;
    }
    public set channels(val: number) {
        console.warn(val);
        if (this._channels === val)
            return;

        this._channels = val;
        this.emit('channels', this._channels);
    }

    public get r(): number {
        if (this._link) {
            return Math.floor(this._link.get(this.path + '.0') * 255);
        } else {
            return this._values[0];
        }
    }
    public set r(val: number) {
        val = Math.min(0, Math.max(255, val));

        if (this._values[0] === val)
            return;

        this._values[0] = val;
        this.emit('r', this._values[0]);
        this.emit('change', this._values.slice(0, this._channels));
    }

    public get g(): number {
        if (this._link) {
            return Math.floor(this._link.get(this.path + '.1') * 255);
        } else {
            return this._values[1];
        }
    }
    public set g(val: number) {
        val = Math.min(0, Math.max(255, val));

        if (this._values[1] === val)
            return;

        this._values[1] = val;

        if (this._channels >= 2) {
            this.emit('g', this._values[1]);
            this.emit('change', this._values.slice(0, this._channels));
        }
    }

    public get b(): number {
        if (this._link) {
            return Math.floor(this._link.get(this.path + '.2') * 255);
        } else {
            return this._values[2];
        }
    }
    public set b(val: number) {
        val = Math.min(0, Math.max(255, val));

        if (this._values[2] === val)
            return;

        this._values[2] = val;

        if (this._channels >= 3) {
            this.emit('b', this._values[2]);
            this.emit('change', this._values.slice(0, this._channels));
        }
    }

    public get a(): number {
        if (this._link) {
            return Math.floor(this._link.get(this.path + '.3') * 255);
        } else {
            return this._values[3];
        }
    }
    public set a(val: number) {
        val = Math.min(0, Math.max(255, val));

        if (this._values[3] === val)
            return;

        this._values[3] = val;

        if (this._channels >= 4) {
            this.emit('a', this._values[3]);
            this.emit('change', this._values.slice(0, this._channels));
        }
    }

    public get hex(): string {
        var values = this._values;

        if (this._link) {
            values = this._link.get(this.path).map(function (channel: number) {
                return Math.floor(channel * 255);
            });
        }

        var hex = '';
        for (var i = 0; i < this._channels; i++) {
            hex += ('00' + values[i].toString(16)).slice(-2);
        }
        return hex;
    }
    public set hex(val: string) {
        console.log('todo color-field: ' + val);
    }


    public get value(): number[] {

        if (this._link)
            return this._link.get(this.path);
        else
            return this._values;
    }
    public set value(val: number[]) {
        // console.error(val);
        if (this._link)
            this._link.set(this.path, val);
        else
            this._values = val;
        this.emit('change', val);
    }


    public constructor() {
        super();

        this.element = document.createElement('div');
        this.element.tabIndex = 0;
        this.element.classList.add('ui-color-field', 'rgb');

        this.elementColor = document.createElement('span');
        this.elementColor.classList.add('color');
        this.element.appendChild(this.elementColor);

        this._channels = 3;
        this._values = [0, 0, 0, 0];

        // space > click
        this.element.addEventListener('keydown', this._onKeyDown.bind(this), false);

        // render color back
        this.on('change', this._onChange);

        // link to channels
        this.evtLinkChannels = [];
        this.on('link', this._onLink);
        this.on('unlink', this._onUnlink);

    }


    private _onKeyDown(evt: KeyboardEvent) {
        if (evt.keyCode === 27) // ESC按键
            return this.element!.blur();

        if (evt.keyCode !== 13 || this.disabled)  // Enter回车键
            return;

        evt.stopPropagation();
        evt.preventDefault();
        this.emit('click');
    };

    private _onChange(color: any) {
        if (this._channels === 1) {
            this.elementColor.style.backgroundColor = 'rgb(' + [this.r, this.r, this.r].join(',') + ')';
        } else if (this._channels === 3) {
            this.elementColor.style.backgroundColor = 'rgb(' + this._values.slice(0, 3).join(',') + ')';
        } else if (this._channels === 4) {
            var rgba = this._values.slice(0, 4);
            rgba[3] /= 255;
            this.elementColor.style.backgroundColor = 'rgba(' + rgba.join(',') + ')';
        } else {
            console.log('unknown channels', color);
        }
    };

    private _onLink(): void {
        let that = this;
        for (var i = 0; i < 4; i++) {
            this.evtLinkChannels[i] = this._link!.on(this.path + '.' + i + ':set', function (value: any) {
                that._setValue(that._link!.get(that.path));
            }.bind(that));
        }
    };

    private _onUnlink(): void {
        for (var i = 0; i < this.evtLinkChannels.length; i++)
            this.evtLinkChannels[i].unbind();

        this.evtLinkChannels = [];
    };

    public _onLinkChange(value: number[]) {
        if (!value)
            return;

        this._setValue(value);
    };


    private _setValue(value: number[]) {
        var changed = false;

        if (!value)
            return;

        if (value.length !== this._channels) {
            changed = true;
            this.channels = value.length;
        }

        for (var i = 0; i < this._channels; i++) {
            if (this._values[i] === Math.floor(value[i]))
                continue;

            changed = true;
            this._values[i] = Math.floor(value[i]);
        }

        if (changed)
            this.emit('change', this._values.slice(0, this._channels));
    };


}