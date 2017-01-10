Architecture
============

General
-------

- Don't die
- Upkeep
- Civilian micro
- Army micro
- Grow
- Deferreds

- Garbage Collection
- Idle/Stuck detection (count ticks?)
- Path caching
- Object caching
- CPU and other stats


Macro
-----

- Plan out tasks for existing resources
- Assign creeps to jobs
- Construct missing creeps according to work/energy balance
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

- Improve Scheduler:
https://en.wikipedia.org/wiki/Multilevel_feedback_queue
a combination of fixed-priority preemptive scheduling, round-robin, and first in, first out algorithms. In this system, threads can dynamically increase or decrease in priority depending on if it has been serviced already, or if it has been waiting extensively. Every priority level is represented by its own queue, with round-robin scheduling among the high-priority threads and FIFO among the lower-priority ones. In this sense, response time is short for most threads, and short but critical system threads get completed very quickly.

- mine
- pick up (hauler?)

- assign source by lowest capacity
- don't spawn creeps for idle tasks

- remember last action and outcome
- transfer energy to other target if close

- check distance for working
- repair broken creep: don't move
- if source any, pick a target and stay with it?

- planner: assign sources according to plan

- reassign new task according to old job
- statistics about tasks

- clean up all tasks if nothing gets finished

- try/catch wrap main tasks and creep actions
function wrap(fn) {try {fn()} catch(e) {/*handle*/}}


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
- Tower
 => extension
 => extension
 => upgrade controller to lvl 4
- Storage
- Roads
 => Repair
- LDH
- Walls
 => build wall

------------------
-> claim another room (level 6?)
-> rampart spawn & storage
-> serious defence
-> minerals, market and stuff
-> SKs

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

Energy levels
=============

1 - 300
2 - 300 +  5 * 50 =  550
3 - 300 + 10 * 50 =  800
4 - 300 + 20 * 50 = 1300

Bodies
======

Worker
------
1x WORK + Nx (1x CARRY, 1x MOVE)

- L1 [WORK, CARRY, CARRY, MOVE, MOVE]

Miners
------
5x WORK + 1x MOVE (+ CARRY + MOVE)

- L2 [WORK, WORK, WORK, WORK, MOVE]

Hauler
------

2x CARRY, 1x MOVE

- L1 [CARRY, CARRY, MOVE]

// - LDH
// - claim
// - defence
// - offence

PB Times
=====

RCL 2:  551
1. EX: 1278             727
2. EX: 2060             700
3. EX: 2827             870
4. EX: 3665             830
5. EX: 5024             1400

tedivm: RCL3 in 16k

Ideas
=====

- Scout clockwise algorythm
- Early scout exits
- try throwing out _.property declarations in lodash definition
- flood fill for initial placement

Layout
======

- Spawn and Storage distanz > 10
- Tower in der Mitte
- Storage nahe Source oder lieber Mitte?
- Extension Checkerboard
- Terminal?
- Labs: woanders
