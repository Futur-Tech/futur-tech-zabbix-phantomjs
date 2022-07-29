// PhantomJS script to reboot a Huawei B315 modem
//
// Author: Jonathan Hoskin / 2017-09-02
// Twitter: @jhossnz
// Github: https://github.com/jonathanhoskin
//
// Requires PhantomJS ~ 2.1.1
//
// Enter your own modem details here

phantom.injectJs('/usr/local/etc/futur-tech-zabbix-phantomjs.conf');

// import { huawei_rtr_usr, huawei_rtr_pwd, huawei_rtr_host } 

// import huawei_rtr_usr from '/usr/local/etc/futur-tech-zabbix-phantomjs.conf';
// var huawei_rtr_usr = 'admin';
// var huawei_rtr_pwd = 'Retinal-Mower2-Contort';
// var huawei_rtr_host = '192.168.2.1';
// End modem details
//
//
// Script specific variables
var page = require('webpage').create();
var loadInProgress = false;
var intervalTime = 1000;
var homeUrl = 'http://' + huawei_rtr_host + '/html/home.html';
var rebootUrl = 'http://' + huawei_rtr_host + '/html/reboot.html';
// End script variable

page.onConsoleMessage = function (msg) {
    console.log(msg);
};

page.onLoadStarted = function () {
    loadInProgress = true;
    if (page.url) {
        console.log('Page load started: ' + page.url);
    } else {
        console.log('Page load started');
    }
};

page.onLoadFinished = function () {
    loadInProgress = false;
    if (page.url) {
        console.log('Page load finished: ' + page.url);
    } else {
        console.log('Page load finished');
    }
};

function checkLoggedIn() {
    if (loadInProgress) {
        console.log('Still logging in...');
        return false;
    } else {
        var loggedIn = page.evaluate(function () {
            return ($('#logout_span').text() === 'Log Out');
        });
        return loggedIn;
    }
}

function waitUntilLoggedIn(callback) {
    setTimeout(function () {
        if (checkLoggedIn()) {
            callback(true);
        } else {
            console.log('Waiting for logged in page JS...');
            waitUntilLoggedIn(callback);
        }
    }, intervalTime);
}

function loginDialogVisible() {
    var visible = page.evaluate(function () {
        return ($('#dialog').length > 0);
    });
    return visible;
}

function waitForLoginDialog(callback) {
    setTimeout(function () {
        if (loginDialogVisible) {
            callback(true);
        } else {
            console.log('Waiting for login dialog JS...');
            waitForLoginDialog(callback);
        }
    }, intervalTime);
}

function language(callback) {
    page.open(homeUrl, function (status) {
        if (status !== 'success') {
            console.log('Unable to load home.html');
            phantom.exit();
        } else {
            console.log('Loaded home.html');

            var language = page.evaluate(function () {
                return $('#lang').prop('selectedIndex');
            });

            if (language != 0) {
                console.log('Changing language to English');
                page.evaluate(function () {
                    $('#lang').val('en_us').change();
                });
                setTimeout(function () {
                    callback();
                }, 5000); // 5 second sleep, just to give time for reloading lanaguage
            } else {
                console.log('Language is English');
                callback();
            }
        }
    });
}

function login(callback) {

    page.open(homeUrl, function (status) {
        if (status !== 'success') {
            console.log('Unable to load home.html');
            phantom.exit();
        } else {
            console.log('Loaded home.html');

            page.evaluate(function () {
                // This is a call to a JS method in the page main.js file
                showloginDialog();
                return true;
            });

            waitForLoginDialog(function () {
                console.log('Filling login credentials');

                page.evaluate(function (u, p) {
                    $('input#username').val(u);
                    $('input#password').val(p);
                    return true;
                }, huawei_rtr_usr, huawei_rtr_pwd);

                console.log('Clicking Log In button');

                page.evaluate(function () {
                    $('input#pop_login').click();
                    return true;
                });

                console.log('Logging in...');

                waitUntilLoggedIn(function () {
                    console.log('Logged in');
                    callback();
                });
            });
        }
    });
}

function rebootButtonLoaded() {
    var elementLoaded = page.evaluate(function () {
        return ($('#button_reboot').find('input').length > 0);
    });
    return elementLoaded;
}

function rebootConfirmButtonLoaded() {
    var elementLoaded = page.evaluate(function () {
        return ($('input#pop_confirm').length > 0);
    });
    return elementLoaded;
}

function waitUntilRebootButtonLoaded(callback) {
    setTimeout(function () {
        if (loadInProgress) {
            console.log('Reboot page still loading...');
        } else {
            if (rebootButtonLoaded()) {
                callback();
            } else {
                console.log('Waiting for reboot page JS...');
                waitUntilRebootButtonLoaded(callback);
            }
        }
    }, intervalTime);
}

function waitUntilRebootConfirmButtonLoaded(callback) {
    setTimeout(function () {
        if (loadInProgress) {
            console.log('Reboot confirm still loading...');
        } else {
            if (rebootConfirmButtonLoaded()) {
                callback();
            } else {
                console.log('Waiting for reboot confirm JS...');
                waitUntilRebootConfirmButtonLoaded(callback);
            }
        }
    }, intervalTime);
}

function reboot(callback) {
    page.open(rebootUrl, function (status) {
        if (status !== 'success') {
            console.log('Unable to load reboot.html');
            callback();
            return;
        }

        if (page.url !== rebootUrl) {
            console.log('Wrong reboot URL! ' + page.url);
            callback();
            return;
        }

        console.log('Loaded reboot.html');

        waitUntilRebootButtonLoaded(function () {
            console.log('Loaded reboot button');

            page.evaluate(function () {
                var rebootButton = $('#button_reboot').find('input').first();
                $(rebootButton).click();
                return true;
            });

            console.log('Clicked reboot button')

            waitUntilRebootConfirmButtonLoaded(function () {
                console.log('Loaded reboot confirm button');

                page.evaluate(function () {
                    var confirmButton = $('input#pop_confirm');
                    $(confirmButton).click();
                    return true;
                });

                console.log('Clicked reboot confirm button');

                setTimeout(function () {
                    callback();
                }, 5000); // 5 second sleep, just to give the final Ajax calls time to complete
            });
        });
    });
}

language(function () {
    login(function () {
        reboot(function () {
            console.log('Reboot Done');
            phantom.exit();
        });
    });
});
