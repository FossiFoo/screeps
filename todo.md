Architecture
============

General
-------


- Don't die
- Upkeep
- Army positioning
- Grow
- Deferreds

- Garbage Collection
- Path caching
- Object caching
- CPU and other stats


Macro
-----

- Plan out tasks for existing resources
- Construct creeps according to work/energy balance
- Try not to move

Micro
-----

- Gather energy to fulfill tasks
- Transfer energy to structures
- Update controller
- Build existing site
- repair wall
- Defend base
- Scout?
- Mine?
- Raid?

Todo
====


Build order
===========

- 1x Worker (work, carry, move)
 => fill energy
- 2x Worker (work, carry, move)
 => upgrade controller to lvl 2
 => 5x extension
- Miner (1x move, Nx work)
 => move to source/container
- Hauler (move, carry, carry)
 => take one source
 => withdraw, pickup
 => fill extension, spawn, storage, container
- Hauler
- Miner
- Hauler
 => upgrade controller to lvl 3
- Container Source 1
- Container Source 2
- Turret
 => extension
 => extension
- Storage
- Roads
 => Repair
- LDH
- Walls
 => build wall

------------------
-> market and stuff

Goals
=====

- Gather all 3000 energy from a source
- Deplete a source just as its timer runs out (provokes thought about efficient mining practices)
- Harvest from three sources in the same tick (multi-room functionality)
- Have a creep travel through 10 different rooms (multi-room functionality)
- Successfully defend against 5 invaders you placed manually (defense testing)
- Sell 10k of some resource on the market
- Buy 10k energy on the market
- Kill a Source Keeper
- Completely deplete a source in a  source keeper room
