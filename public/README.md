# Deploy folder for the MoneyLog app

This is the root of the https://moneylog.aurelio.net website.

- Put static site-only files here.

- Repository files are added here at deploy time by the
  [util/deploy.sh](https://github.com/aureliojargas/moneylog/blob/master/util/deploy.sh)
  script.

The deploy is handled automatically by Netlify:
every commit to the `master` branch triggers a deploy.

Deploy logs at: https://app.netlify.com/sites/moneylog/deploys/

See [netlify.toml](https://github.com/aureliojargas/moneylog/blob/master/netlify.toml)
for the build commands.
