FROM node:12.16.3-alpine

RUN apk add --no-cache \
  python \
  py-pip \
  py-setuptools \
  bash
RUN pip install --no-cache-dir --upgrade pip awscli

RUN yarn global add serverless --prefix /usr/local

RUN mkdir -p /app
WORKDIR /app
