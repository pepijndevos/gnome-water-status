/**
 * Created by Julien "delphiki" Villetorte (delphiki@protonmail.com)
 */
const Main = imports.ui.main;
const { Clutter, GLib, St, Gio } = imports.gi;
const ByteArray = imports.byteArray;
const Mainloop = imports.mainloop;
const Me = imports.misc.extensionUtils.getCurrentExtension();

let waterstatus;
let ttypath = '/dev/ttyACM0';
let empty_icon = Gio.icon_new_for_string(Me.path + '/cup_empty.svg');
let full_icon = Gio.icon_new_for_string(Me.path + '/cup_full.svg');

class WaterStatus {
    constructor(menu, filePath) {
        this._menu = menu;
        this._ttypath = filePath;
        this._box = new St.BoxLayout();

        this._timeout = null;
        this._waterlabel = null;
        this._icon = null;

        this._prevtty = false;

        this.buildLayout();

    }
    
    readStatus() {
        let ttyavailable = GLib.file_test(this._ttypath, GLib.FileTest.EXISTS)
        if (!ttyavailable) {
            // Log("file missing")
            this._prevtty = ttyavailable;
            return true;
        }

        if (!this._prevtty && ttyavailable) {
            Log("tty appeared, stty")
            let proc = Gio.Subprocess.new(['stty', '-F', this._ttypath, "min", "0"], Gio.SubprocessFlags.NONE);
            proc.wait_async(null, (proc, result) => {
                    proc.wait_finish(result);
                    if (proc.get_successful()) {
                        Log('stty succeeded');
                    } else {
                        Log('stty failed');
                    }
            });
            this._prevtty = ttyavailable;
            return true;
        }

        // Log("file exists")

        let fileContents = GLib.file_get_contents(this._ttypath)[1];

        let lines = ByteArray.toString(fileContents).trim().split('\n');
        let lastLine = lines[lines.length - 1];
        if(lastLine.length > 0) {
            let values = lastLine.split(';');
            // Log(lastLine)

            if (parseInt(values[0])) {
                this._icon.set_gicon(full_icon);
            } else {
                this._icon.set_gicon(empty_icon);
            }
            this._waterlabel.set_text(Math.round(parseFloat(values[4]))+'ml');
        }

        return true;
    }

    buildLayout() {
        this._icon = new St.Icon({
            gicon: Gio.icon_new_for_string(Me.path + '/cup_empty.svg'),
            style_class: "system-status-icon",
        });

        this._waterlabel = new St.Label({
            text: '-',
            y_align: Clutter.ActorAlign.CENTER,
            style_class: "water-ml"
        });

        this._box.add(this._icon);
        this._box.add(this._waterlabel);
    }

    enable() {
        this._menu.insert_child_at_index(this._box, 0);

        let self = this;
        this._timeout = Mainloop.timeout_add(1000, function() {
            return self.readStatus();
        });
    }

    disable() {
        this._menu.remove_child(this._box);
        Mainloop.source_remove(this._timeout);
    }
}

function enable() {
    let menu = Main.panel.statusArea.aggregateMenu._indicators;
    waterstatus = new WaterStatus(menu, ttypath);
    waterstatus.enable();
}

function disable() {
    if (waterstatus) {
        waterstatus.disable();
        waterstatus = null;
    }
}

let Log = function(msg) {
    log("[Water Status] " + msg);
}
