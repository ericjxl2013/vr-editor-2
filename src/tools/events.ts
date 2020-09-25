export class Events {

    // 相较于Editor，同一个函数名可包含一系列函数，不仅仅是一个，且有once功能；
  
    public get suspendEvents(): boolean {
      return this._suspendEvents;
    }
    public set suspendEvents(val: boolean) {
      this._suspendEvents = val;
    }
    private _suspendEvents: boolean = false;
  
    // 某个name对应的事件数组，name与Function是1对多的关系；
    private _events: { [key: string]: Function[] } = {};
  
    public constructor() {
  
    }
  
    /**
     * 添加事件数组，若name相同，则在数组末尾继续添加；
     * @param name 函数名；
     * @param fn 函数本体；
     */
    public on(name: string, fn: Function): EventHandle {
      let events: Function[] = this._events[name];
      if (events === undefined) {
        this._events[name] = [fn];
      } else {
        if (events.indexOf(fn) == -1) {
          events.push(fn);
        }
      }
      return new EventHandle(this, name, fn);
    }
  
    /**
     * emit后只执行一次；
     * @param name 函数名；
     * @param fn 函数本体；
     */
    public once(name: string, fn: Function): EventHandle {
      let self = this;
      let evt: EventHandle = this.on(name, function (
        arg0: any,
        arg1: any,
        arg2: any,
        arg3: any,
        arg4: any,
        arg5: any,
        arg6: any,
        arg7: any
      ) {
        fn.call(self, arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7);
        evt.unbind();
      });
      return evt;
    }
  
    /**
     * 执行事件；
     * @param name 函数名；
     * @param arg0 函数参数1，可选；
     * @param arg1 函数参数2，可选；
     * @param arg2 函数参数3，可选；
     * @param arg3 函数参数4，可选；
     * @param arg4 函数参数5，可选；
     * @param arg5 函数参数6，可选；
     * @param arg6 函数参数7，可选；
     * @param arg7 函数参数8，可选；
     */
    public emit(name: string,
      arg0?: any,
      arg1?: any,
      arg2?: any,
      arg3?: any,
      arg4?: any,
      arg5?: any,
      arg6?: any,
      arg7?: any
    ): Events {
      if (this._suspendEvents) return this;
  
      let events: Function[] = this._events[name];
      if (!events) return this;
  
      // 返回新数组
      events = events.slice(0);
  
      for (let i: number = 0; i < events.length; i++) {
        if (!events[i]) continue;
        try {
          events[i].call(this, arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7);
        } catch (ex) {
          console.info("%c%s %c(event error)", "color: #06f", name, "color: #f00");
          console.log(ex.stack);
        }
      }
  
      return this;
    };
  
    /**
     * 取消Events事件绑定，若name为空，则清空events；
     * @param name 函数名；
     * @param fn 函数本体；
     */
    public unbind(name?: string, fn?: Function): Events {
      if (name) {
        let events: Function[] = this._events[name];
        if (!events) return this;
  
        if (fn) {
          let i: number = events.indexOf(fn);
          if (i !== -1) {
            if (events.length === 1) {
              delete this._events[name];
            } else {
              events.splice(i, 1);
            }
          }
        } else {
          delete this._events[name];
        }
      } else {
        this._events = {};
      }
  
      return this;
    };
  
  }
  
  
  export class EventHandle {
  
    public name: Nullable<string>;
  
    public owner: Nullable<Events>;
  
    public fn: Nullable<Function>;
  
    public constructor(owner: Events, name: string, fn: Function) {
      this.owner = owner;
      this.name = name;
      this.fn = fn;
    }
  
    public unbind(): void {
      if (!this.owner) return;
  
      this.owner.unbind(this.name!, this.fn!);
  
      this.owner = null;
      this.name = null;
      this.fn = null;
    }
  
    public call(): void {
      if (!this.fn) return;
  
      this.fn.call(
        this.owner!,
        arguments[0],
        arguments[1],
        arguments[2],
        arguments[3],
        arguments[4],
        arguments[5],
        arguments[6],
        arguments[7]
      );
    }
  
    public on(name: string, fn: Function): EventHandle {
      return this.owner!.on(name, fn);
    }
  
  }