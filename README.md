> **EXPERIMENTAL CODE. NOT READY FOR PRODUCTION USE.**

# mobware-client [![Build Status](https://travis-ci.org/appcelerator/mobware-client.svg?branch=master)](https://travis-ci.org/appcelerator/mobware-client)

Appcelerator Mobware client CLI

## install [![NPM version](https://badge.fury.io/js/mobware-client.svg)](http://badge.fury.io/js/mobware-client)

```bash
$ npm install -g mobware-client
```

## usage

### enable

Enables a Titanium project for MW. It makes an HTTPS request to MW servers and gets API keys in return.  The keys are then added to the user's tiapp.xml file.

```bash
  Usage: mobware-client-enable username password [options]

  Options:

    -h, --help             output usage information
    -a, --app-id <app-id>  App ID with which to associate this MW enablement
    -H, --host <host>      The host for connecting to the MW server
    -P, --no-prompt        No interactive prompting
    -p, --port <port>      The port for connecting to the MW server
    -t, --tiapp <tiapp>    Path to tiapp.xml to be updated

  Examples:

    # specify only the required values, use defaults for the rest
    $ mobware-client enable myusername mypassword

    # configure it heavily
    $ mobware-client enable myusername mypassword --tiapp /path/to/tiapp.xml \
        --host 360-dev.appcelerator.com --port 443 \
        --appId 7bd1239e-b199-4fbc-9c1c-30aa0b8d08ea

```

The result of a successful call:

```xml
<ti:app>
	<property name="mw-key-dev" type="string">DEVKEY</property>
	<property name="mw-key-prod" type="string">PRODKEY</property>
</ti:app>
```

### disable

The opposite of [enable][], this process will remove MW API keys from your tiapp.xml, thereby invalidating any MW SDK usage. It exits quietly if no keys are present in the tiapp.xml.

```bash
  Usage: mobware-client-disable [options]

  Options:

    -h, --help           output usage information
    -t, --tiapp <tiapp>  Path to tiapp.xml

  To disable Mobware in a project:

    $ mobware-client disable --tiapp /path/to/tiapp.xml
```

### keys

Get the MW API keys from the tiapp.xml of an MW-enabled project.

```bash
  Usage: mobware-client-keys [options]

  Options:

    -h, --help           output usage information
    -k, --keys <keys>    Key type to return. Can be a comma-separated list.
    -t, --tiapp <tiapp>  Path to tiapp.xml

  Examples:

    # list all Mobware keys for an enabled project
    $ mobware-client keys
      { "development": "DEVKEY", "production": "PRODKEY" }

    # list specific key
    $ mobware-client keys --keys production
      { "production": "PRODKEY" }

    # list specific keys as comma-separated list
    $ mobware-client keys --keys production,development
      { "development": "DEVKEY", "production": "PRODKEY" }
```

### sdk

Install, get, or set the API Builder SDK for a project.

```bash
  Usage: mobware-client-sdk install|get|set [NAME] [VERSION] [options]

  Options:

    -h, --help                 output usage information
    -f, --force                overwrite existing updates
    -H, --host <host>          The host for connecting to the MW server
    -p, --password <password>  password for 360 auth
    -P, --port <port>          The port for connecting to the MW server
    -t, --tiapp <tiapp>        Path to tiapp.xml
    -u, --username <username>  username for 360 auth

  Examples:

    # install any available API Builder SDKs
    $ mobware-client install

    # install specific API Builder SDK, with optional version
    $ mobware-client install my.apibuilder.sdk
    $ mobware-client install some.api@1.2.3

    # get current Mobware SDK name from tiapp.xml
    $ mobware-client sdk get
      name.of.mobwareSdk

    # set Mobware SDK
    $ mobware-client sdk set my.mw.sdk

    # set Mobware SDK with version
    $ mobware-client sdk set my.mw.sdk 2.0
```

The `set` command above would generate a section like this in your tiapp.xml:

```xml
<ti:app>
	<modules>
		<module version="2.0" platform="commonjs">ti.mw.todo</module>
	</modules>
</ti:app>
```

## Testing & Coverage [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

```bash
# run tests & linting
$ grunt

# generate code coverage report
$ grunt coverage
```

## Reporting Bugs or submitting fixes

If you run into problems, please create an [Issue](https://github.com/appcelerator/mobware-client/issues) or, even better, send us a pull request.

## Contributing

To protect the interests of the mobware-client contributors, Appcelerator, customers and end users we require contributors to sign a Contributors License Agreement (CLA) before we pull the changes into the main repository. Our CLA is simple and straightforward - it requires that the contributions you make to any Appcelerator open source project are properly licensed and that you have the legal authority to make those changes. This helps us significantly reduce future legal risk for everyone involved. It is easy, helps everyone, takes only a few minutes, and only needs to be completed once.

[You can digitally sign the CLA](http://bit.ly/app_cla) online. Please indicate your email address in your first pull request so that we can make sure that will locate your CLA.  Once you've submitted it, you no longer need to send one for subsequent submissions.

## Legal

Copyright (c) 2014 by [Appcelerator, Inc](http://www.appcelerator.com). All Rights Reserved.
This code contains patents and/or patents pending by Appcelerator, Inc.
mobware-client is a trademark of Appcelerator, Inc.
This project is licensed under the Apache Public License, version 2.  Please see details in the LICENSE file.


[enable]: #enable
