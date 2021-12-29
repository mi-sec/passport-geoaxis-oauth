UNAME:= $(shell uname)
ifeq ($(UNAME),Darwin)
		OS_X  := true
		SHELL := /bin/bash
else
		OS_DEB  := true
		SHELL := /bin/bash
endif

check:
	@echo "Checking Node.js version"
	@if [ "${NODE_EXPECTED}" != "${NODE_ACTUAL}" ]; then echo "Ensure you are running Node.js ${NODE_EXPECTED}"; exit 1; fi
	@echo "Node.js version correct"
	@echo "Checking PM2 version"
	@if [ "${PM2_EXPECTED}" != "${PM2_ACTUAL}" ]; then echo "Ensure you are running PM2 ${PM2_EXPECTED}"; exit 1; fi
	@echo "PM2 version correct"

start-docker:
	@echo "starting up docker build"
	npm --prefix ./ui run build
	BUILD_ENV=production docker-compose -f docker-compose.yml up --build -d
