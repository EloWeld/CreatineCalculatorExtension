const INSTALL_URL = 'https://www.google.com';
const UPDATE_URL = '';
const SHARED_MODULE_UPDATE_URL = '';
const CHROME_UPDATE_URL = '';
const UNINSTALL_URL = 'https://www.google.com/search?q=Why+are+you+running%3F&sca_esv=245dc9e7f862aecc&sca_upv=1&sxsrf=ACQVn0-yoFIFEKSH5BnZ2QaCJO4pc2swCg%3A1714637665407&source=hp&ei=YUszZoqHFt2wwPAP-vaYgAM&iflsig=ANes7DEAAAAAZjNZcaQYD5LDvuCUj5QO6cY9RIw6Uec5&udm=&ved=0ahUKEwjKu9mHw-6FAxVdGBAIHXo7BjAQ4dUDCBU&uact=5&oq=Why+are+you+running%3F&gs_lp=Egdnd3Mtd2l6IhRXaHkgYXJlIHlvdSBydW5uaW5nPzIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyCBAAGIAEGMsBMggQABiABBjLATIIEAAYgAQYywEyCBAAGIAEGMsBMggQABiABBjLATIIEAAYgAQYywFI9VdQAFjzVHAIeACQAQCYAYUBoAH8FqoBBTE0LjE0uAEDyAEA-AEBmAIkoALWF8ICChAjGIAEGCcYigXCAgQQIxgnwgIREC4YgAQYsQMY0QMYgwEYxwHCAggQABiABBixA8ICCxAAGIAEGLEDGIMBwgIIEC4YgAQYsQPCAgsQLhiABBixAxiDAcICBRAuGIAEwgIOEC4YgAQYxwEYjgUYrwHCAg4QLhiABBixAxiDARjUAsICBBAuGAPCAgcQLhiABBgKwgIMEAAYgAQYChhGGP8BwgIHEAAYgAQYCsICChAAGIAEGEYY_wHCAgYQABgWGB7CAggQABiABBiiBMICBRAhGKABwgIHECEYoAEYCpgDAJIHBTE4LjE4oAeY4AE&sclient=gws-wiz';

chrome.runtime.onInstalled.addListener((details) => {
    const open_url = (url) => {
        if (url) {
            chrome.tabs.create({
                url: url,
            });
        }
    }
    switch (details.reason) {
        case chrome.runtime.OnInstalledReason.INSTALL:
            chrome.runtime.setUninstallURL(UNINSTALL_URL);
            open_url(INSTALL_URL);
            break;
        case chrome.runtime.OnInstalledReason.UPDATE:
            open_url(UPDATE_URL);
            break;
        case chrome.runtime.OnInstalledReason.SHARED_MODULE_UPDATE:
            open_url(SHARED_MODULE_UPDATE_URL);
            break;
        case chrome.runtime.OnInstalledReason.CHROME_UPDATE:
            open_url(CHROME_UPDATE_URL);
            break;
    }
});
