> **EXPERIMENTAL CODE. NOT READY FOR PRODUCTION USE.**

# mobware-client

Appcelerator Mobware client CLI

## install

```bash
$ npm install -g mobware-client
```

## usage

### enable

Enables a Titanium project for MW. It makes an HTTPS request to MW servers and gets API keys in return.  The keys are then added to the user's tiapp.xml file.

```bash
$ mobware-client enable USERNAME PASSWORD --app-id APP_ID --tiapp TIAPP_XML
```

* **USERNAME**: The user's Appcelerator account username.
* **PASSWORD**: The user's Appcelerator account password
* **APP_ID**: The `<id>` property in the tiapp.xml
* **TIAPP_XML**: Full path to this project's tiapp.xml file

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
$ mobware-client disable --tiapp TIAPP_XML
```

* **TIAPP_XML**: Full path to this project's tiapp.xml file

### keys

Get the MW API keys from the tiapp.xml.

```bash
# get all keys
$ mobware-client keys
{ "development": "DEVKEY", "production": "PRODKEY" }

# get specific key
$ mobware-client keys --keys production
{ "production": "PRODKEY" }
```

### sdk

Get the active MW SDK for the project.

```bash
$ mobware-client sdk get --tiapp TIAPP_XML
```

Or set the active MW SDK for the project.

```bash
$ mobware-client sdk set ti.mw.todo 2.0 --tiapp TIAPP_XML
$ mobware-client sdk set ti.mw.todo --tiapp TIAPP_XML
```

```xml
<ti:app>
	<modules>
		<module version="2.0" platform="commonjs">ti.mw.todo</module>
	</modules>
</ti:app>
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
