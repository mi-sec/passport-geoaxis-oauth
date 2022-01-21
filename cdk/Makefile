UNAME:= $(shell uname)
ifeq ($(UNAME),Darwin)
		OS_X  := true
		SHELL := /bin/bash
else
		OS_DEB  := true
		SHELL := /bin/bash
endif

clean:
	@echo "cleaning project"
	rm -rf ./ui/dist
	@if [ -d "./outputs-api.json" ]; then rm ./outputs-api.json; fi
	@if [ -d "./outputs-ui.json" ]; then rm ./outputs-ui.json; fi

prepare: clean
	@echo "preparing project"
	npm install
	npm --prefix ./lambda install
	npm --prefix ./ui install

deploy: prepare
	@echo "deploying project"
	cdk synth
	cdk deploy GeoaxisApiStack --outputs-file outputs-api.json
	cdk deploy GeoaxisUiStack --outputs-file outputs-ui.json
	node tools/prepare-ui-env-params.js
	npm --prefix ./ui run build
	node tools/deploy-app.js
