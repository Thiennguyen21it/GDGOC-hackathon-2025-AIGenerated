FROM debian:stable-slim
ENV DEBIAN_FRONTEND=noninteractive

RUN echo "deb http://deb.debian.org/debian stable main" > /etc/apt/sources.list && \
    echo "deb http://deb.debian.org/debian stable-updates main" >> /etc/apt/sources.list && \
    echo "deb http://deb.debian.org/debian-security stable-security main" >> /etc/apt/sources.list

RUN apt-get update && apt-get install -qyf \
    curl jq make git \
    python3-pygments gnuplot \
    texlive-latex-recommended texlive-latex-extra texlive-fonts-recommended \
    texlive-lang-other texlive-lang-cyrillic \
    texlive-lang-all && \
    rm -rf /var/lib/apt/lists/*

COPY compile.sh /usr/local/bin/compile.sh
RUN chmod +x /usr/local/bin/compile.sh

WORKDIR /data
VOLUME ["/data"]

ENTRYPOINT ["compile.sh"]
