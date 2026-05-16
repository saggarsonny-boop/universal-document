#!/bin/bash

TOTAL_LOST=0
PAGES=5 # let's just scrape the first 5 pages to be safe, or loop until no next button

osascript << 'EOF'
tell application "Safari"
    set jsCode to "
        (function() {
            let total = 0;
            let rows = document.body.innerText.match(/-\\$\d{1,3}(,\d{3})*\\.\\d{2}/g);
            if(rows) {
                rows.forEach(r => {
                    let val = parseFloat(r.replace(/[-\\$,]/g, ''));
                    total += val;
                });
            }
            return total;
        })();
    "
    set pageTotal to do JavaScript jsCode in current tab of front window
    return pageTotal
end tell
EOF
