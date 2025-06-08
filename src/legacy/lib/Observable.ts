type Listener<T> = (value: T) => void;

export class Observable<T> {
    private _value: T;
    private listeners: Listener<T>[] = [];

    constructor(initialValue: T) {
        this._value = initialValue;
    }

    subscribe(listener: Listener<T>) {
        this.listeners.push(listener);
    }

    unsubscribe(listener: Listener<T>) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    set value(newValue: T) {
        this._value = newValue;
        this.listeners.forEach(listener => listener(newValue));
    }

    get value(): T {
        return this._value;
    }
}