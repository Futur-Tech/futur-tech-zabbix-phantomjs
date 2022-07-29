#!/usr/bin/env bash

source "$(dirname "$0")/ft-util/ft_util_inc_var"

app_name="futur-tech-zabbix-phantomjs"

required_pkg_arr=( "phantomjs" "at" )

bin_dir="/usr/local/bin/${app_name}"
src_dir="/usr/local/src/${app_name}"
etc_f="/usr/local/etc/${app_name}.conf"
# log_f="/var/log/${app_name}.log"
sudoers_etc="/etc/sudoers.d/${app_name}"

$S_LOG -d $S_NAME "Start $S_DIR_NAME/$S_NAME $*"

# Checking which Zabbix Agent is detected and adjust include directory
$(which zabbix_agent2 >/dev/null) && zbx_conf_agent_d="/etc/zabbix/zabbix_agent2.d"
$(which zabbix_agentd >/dev/null) && zbx_conf_agent_d="/etc/zabbix/zabbix_agentd.conf.d"
if [ ! -d "${zbx_conf_agent_d}" ] ; then $S_LOG -s warn -d $S_NAME "${zbx_conf_agent_d} Zabbix Include directory not found" ; fi

echo "
    CHECK NEEDED PACKAGES
------------------------------------------"
$S_DIR_PATH/ft-util/ft_util_pkg -u -i ${required_pkg_arr[@]} || exit 1


echo "
    SETUP SUDOER FILES
------------------------------------------"

$S_LOG -d $S_NAME -d "$sudoers_etc" "==============================="
echo "Defaults:zabbix !requiretty" | sudo EDITOR='tee' visudo --file=$sudoers_etc &>/dev/null
echo "zabbix ALL=(ALL) NOPASSWD:$(type -p phantomjs)" | sudo EDITOR='tee -a' visudo --file=$sudoers_etc &>/dev/null
cat $sudoers_etc | $S_LOG -d "$S_NAME" -d "$sudoers_etc" -i 
$S_LOG -d $S_NAME -d "$sudoers_etc" "==============================="


echo "
    INSTALL BIN FILES
------------------------------------------"
    if [ ! -d "${bin_dir}" ] ; then mkdir "${bin_dir}" ; $S_LOG -s $? -d $S_NAME "Creating ${bin_dir} returned EXIT_CODE=$?" ; fi
	$S_DIR/ft-util/ft_util_file-deploy "$S_DIR/bin/" "${bin_dir}"


echo "
    CONFIGURATION FILES
------------------------------------------"

$S_DIR/ft-util/ft_util_conf-update -s "$S_DIR/etc/${app_name}.conf" -d "$etc_f"

$S_LOG -d "$S_NAME" "End $S_NAME"
