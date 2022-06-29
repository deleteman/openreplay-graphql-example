import OpenReplay from '@openreplay/tracker';

let _tracker = null;

export function init({plugins}) {

    _tracker = new OpenReplay({
        projectKey: "DFvi71nm2JTyGDeThjh6",
        __DISABLE_SECURE_MODE: true
    });

    
    let pluginResults = {}
    if(plugins) {
        Object.keys(plugins).forEach( pk => {
            pluginResults[pk] = _tracker.use(plugins[pk]())
        })
    }
    return pluginResults
}

export function start() {
    return _tracker.start()
}
