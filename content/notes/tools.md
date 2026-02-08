+++
date = '2026-01-15T00:25:30+05:00'
draft = true
title = 'Tools New'
+++

## sshuttle

Redirect traffic from local PC to private subnet:

```bash
sshuttle -r "root@${host_ip}" "10.3.0.0/24"
```

## jq

Bash json parsing utility. Examples:

```bash
jq '.resources[] | select(.name == "bastionHost") | .instances[0].attributes.ipv4_address' ./file.json
```

`-r` option helps to without quota output.

## Connection ping without telnet

```bash
timeout 5 bash -c 'cat < /dev/null > /dev/tcp/10.22.32.20/5701'; echo $?
```