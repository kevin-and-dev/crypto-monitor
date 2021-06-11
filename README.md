# crypto-monitor
##### A crypto (mainly BTC &amp; ETH) trading record grabber for self-study.
This is a tiny app monitoring Bitstamp BTC & ETH (additional coin/token can be easily added) transaction in real time and save all transaction into personal Firebase for study and comparison.


#
#### Important!
This project can't be execute BECAUSE Firebase Authrntication Key File has been ignored from repositories.


#
#### PROJECT DESCRIPTION
This code base has been wrote for Digital Ocean Droplet environment (because the costing is fixed) and based on Nodejs with WebSocket technology.

PM2 is the daemon process manager for this project.

Currency pairs has been separatered into individual files because of easier to monitoring. It is totally make sense to have singla code file with currency pair set in env parameter(s).

#
#### LICENSE
MIT License - Feel free to clone and modify for your needs.
