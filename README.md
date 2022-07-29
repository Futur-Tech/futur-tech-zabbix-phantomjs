# Futur-Tech Script PhantomJS for Zabbix

This script will deploy scripts PhantomJS for headless testing of web-based applications, site scraping, pages capture etc.
 
## Deploy Commands

Everything is executed by only a few basic deploy scripts. 

```bash
cd /usr/local/src
git clone https://github.com/Futur-Tech/futur-tech-zabbix-phantomjs.git
cd futur-tech-zabbix-phantomjs

./deploy.sh 
# Main deploy script

./deploy-update.sh -b main
# This script will automatically pull the latest version of the branch ("main" in the example) and relaunch itself if a new version is found. Then it will run deploy.sh. Also note that any additional arguments given to this script will be passed to the deploy.sh script.
```

## Available Scripts 
### huawei-router-reboot.js

> Original script: https://gist.github.com/extremeshok/eb0ef673ba689aa52d072bc9985a31c3

This script will reboot a Huawei router.