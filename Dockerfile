FROM node:12.16.3-alpine

ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY

RUN apk add --no-cache \
  python \
  py-pip \
  py-setuptools \
  bash
RUN pip install --no-cache-dir --upgrade pip awscli

RUN yarn global add serverless --prefix /usr/local

RUN sls config credentials --provider aws --key $AWS_ACCESS_KEY_ID --secret $AWS_SECRET_ACCESS_KEY

RUN mkdir -p /app
WORKDIR /app

ENTRYPOINT ["/bin/bash", "-c"]
