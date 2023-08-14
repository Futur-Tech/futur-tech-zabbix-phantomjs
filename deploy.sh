#!/usr/bin/env bash

source "$(dirname "$0")/ft-util/ft_util_inc_var"
source "$(dirname "$0")/ft-util/ft_util_inc_func"
source "$(dirname "$0")/ft-util/ft_util_sudoersd"
source "$(dirname "$0")/ft-util/ft_util_usrmgmt"

app_name="futur-tech-zabbix-phantomjs"

required_pkg_arr=("phantomjs" "at")

bin_dir="/usr/local/bin/${app_name}"
src_dir="/usr/local/src/${app_name}"
etc_f="/usr/local/etc/${app_name}.conf"

$S_LOG -d $S_NAME "Start $S_DIR_NAME/$S_NAME $*"

# Checking which Zabbix Agent is detected and adjust include directory
$(which zabbix_agent2 >/dev/null) && zbx_conf_agent_d="/etc/zabbix/zabbix_agent2.d"
$(which zabbix_agentd >/dev/null) && zbx_conf_agent_d="/etc/zabbix/zabbix_agentd.conf.d"
if [ ! -d "${zbx_conf_agent_d}" ]; then $S_LOG -s warn -d $S_NAME "${zbx_conf_agent_d} Zabbix Include directory not found"; fi

echo "
  INSTALL NEEDED PACKAGES & FILES
------------------------------------------"
$S_DIR_PATH/ft-util/ft_util_pkg -u -i ${required_pkg_arr[@]} || exit 1

mkdir_if_missing "${bin_dir}"
$S_DIR/ft-util/ft_util_file-deploy "$S_DIR/bin/" "${bin_dir}"
$S_DIR/ft-util/ft_util_conf-update -s "$S_DIR/etc/${app_name}.conf" -d "$etc_f"

enforce_security exec "$bin_dir" zabbix
enforce_security conf "$etc_f" zabbix

echo "
    SETUP SUDOER FILES
------------------------------------------"

bak_if_exist "/etc/sudoers.d/${app_name}"
sudoersd_reset_file $app_name zabbix
sudoersd_addto_file $app_name zabbix "${S_DIR_PATH}/deploy-update.sh"
sudoersd_addto_file "$app_name" "zabbix" "$(type -p phantomjs)"
show_bak_diff_rm "/etc/sudoers.d/${app_name}"
