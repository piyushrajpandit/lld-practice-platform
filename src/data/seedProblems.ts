import { Problem } from '../domain/Problem';

export const SEED_PROBLEMS: Problem[] = [
  new Problem(
    'parking-lot',
    'Design a Parking Lot System',
    'parking-lot',
    'MEDIUM',
    'System Design / Object Modeling',
    'Design an automated multi-floor parking lot system that can manage different vehicle types, assign spots, issue tickets, and calculate fees upon exit.',
    [
      'Support multi-floor parking lot with different spot types (Compact, Large, Handicap, Electric).',
      'Support different vehicle types (Motorcycle, Car, SUV, Bus/Truck).',
      'Issue a ParkingTicket upon entry containing entry timestamp and spot location.',
      'Process exit payment based on hourly pricing policy for vehicle type.',
      'Display available spot counters dynamically per floor.'
    ],
    [
      'Thread safety for concurrent spot allocation during peak hours.',
      'Extensible pricing policy (e.g. Peak hour surge pricing, weekend discounts).',
      'Clear separation of spot assignment algorithm from parking lot controller.'
    ],
    ['ParkingLot', 'Floor', 'ParkingSpot', 'Vehicle', 'ParkingTicket', 'PaymentProcessor', 'PricingStrategy'],
    {
      id: 'parking-lot-rubric',
      criteria: [
        {
          id: 'req-coverage',
          name: 'Requirement Coverage & Assumptions',
          weight: 20,
          description: 'Evaluates whether all functional requirements (spot types, ticket generation, payment, availability counters) are addressed.',
          scoringGuide: {
            excellent: 'All requirements modeled with explicit state handling.',
            satisfactory: 'Most requirements covered, minor gaps in ticket/payment flow.',
            needsImprovement: 'Missing core vehicle or ticket modeling.'
          }
        },
        {
          id: 'srp-cohesion',
          name: 'Single Responsibility & Encapsulation',
          weight: 25,
          description: 'Evaluates if classes have single, well-defined responsibilities.',
          scoringGuide: {
            excellent: 'Clean encapsulation. Spot allocation separated from ticket issuance and payment processing.',
            satisfactory: 'Decent separation, slight responsibility overlap.',
            needsImprovement: 'Monolithic class handles spots, tickets, and payment calculations directly.'
          }
        },
        {
          id: 'extensibility-ocp',
          name: 'Extensibility & Design Patterns',
          weight: 25,
          description: 'Evaluates strategy pattern usage for spot assignment and pricing policies.',
          scoringGuide: {
            excellent: 'Uses Strategy Pattern for pricing and spot allocation algorithms.',
            satisfactory: 'Uses basic inheritance/interfaces.',
            needsImprovement: 'Hardcoded switch statements for vehicle fees and spot matching.'
          }
        },
        {
          id: 'edge-cases-tradeoffs',
          name: 'Concurrency & Edge Cases',
          weight: 30,
          description: 'Evaluates handling of full lot scenarios, race conditions, and error states.',
          scoringGuide: {
            excellent: 'Explicitly addresses concurrency locks and idempotency on exit.',
            satisfactory: 'Mentions full lot check.',
            needsImprovement: 'Ignores concurrent spot claiming.'
          }
        }
      ]
    },
    [
      {
        id: 'ext-1',
        prompt: 'How would your design accommodate Electric Vehicle (EV) charging stations with hourly charging fees?',
        hint: 'Consider adding an EVChargingStrategy or decorating ParkingSpot with EVChargingFacility.'
      },
      {
        id: 'ext-2',
        prompt: 'How would you handle automated License Plate Recognition (ALPR) cameras at entry/exit points?',
        hint: 'Use Observer Pattern to listen to gate arrival events.'
      }
    ],
    {
      ts: `// Starter TypeScript Template for Parking Lot
export enum VehicleType {
  MOTORCYCLE,
  CAR,
  SUV,
  TRUCK
}

export enum SpotType {
  COMPACT,
  LARGE,
  HANDICAP,
  ELECTRIC
}

export class Vehicle {
  constructor(public licensePlate: string, public type: VehicleType) {}
}

export class ParkingTicket {
  constructor(
    public ticketId: string,
    public vehicle: Vehicle,
    public spotId: string,
    public entryTime: Date
  ) {}
}

export class ParkingSpot {
  constructor(public id: string, public type: SpotType, public isOccupied: boolean = false) {}
}

export class ParkingLot {
  // TODO: Implement floors, spot assignment strategy, and exit fee calculation
}
`,
      java: `// Starter Java Template
public enum VehicleType { MOTORCYCLE, CAR, SUV, TRUCK }
public enum SpotType { COMPACT, LARGE, HANDICAP, ELECTRIC }

public class Vehicle {
    private String licensePlate;
    private VehicleType type;
    public Vehicle(String licensePlate, VehicleType type) {
        this.licensePlate = licensePlate;
        this.type = type;
    }
}
`
    },
    'Recommended design separates spot allocation algorithm (SpotAssignmentStrategy interface) from ticket management and pricing (PricingStrategy interface), using a facade (ParkingLotController) to coordinate.'
  ),

  new Problem(
    'elevator-system',
    'Design an Elevator Control System',
    'elevator-system',
    'MEDIUM',
    'State & Scheduling / Concurrent System',
    'Design an efficient multi-elevator control system for a high-rise building that dispatches elevators based on floor requests, optimizes wait time, and handles emergency states.',
    [
      'Control multiple elevator cars across N floors.',
      'Support internal floor selection requests (inside elevator car) and external hall calls (Up/Down button on floor).',
      'Optimize elevator dispatching using a scheduling algorithm (e.g. SCAN/LOOK algorithm or Nearest Car).',
      'Support elevator state transitions (IDLE, MOVING_UP, MOVING_DOWN, MAINTENANCE, DOOR_OPEN).'
    ],
    [
      'Thread safety for concurrent hall calls from multiple floors.',
      'Extensible dispatcher strategy (ability to swap algorithm to SCAN or Energy Saving).',
      'Door sensor safety checks before moving.'
    ],
    ['ElevatorController', 'ElevatorCar', 'Request', 'DispatcherStrategy', 'ElevatorState', 'FloorButton'],
    {
      id: 'elevator-rubric',
      criteria: [
        {
          id: 'req-coverage',
          name: 'Requirement Coverage & State Management',
          weight: 25,
          description: 'Evaluates state modeling of elevator cars and request queues.',
          scoringGuide: {
            excellent: 'Clean state machine for elevator movement and request queues.',
            satisfactory: 'Handles basic up/down motion.',
            needsImprovement: 'Missing internal vs external request distinction.'
          }
        },
        {
          id: 'extensibility-ocp',
          name: 'Dispatcher Strategy & Decoupling',
          weight: 35,
          description: 'Evaluates if dispatcher scheduling algorithm is decoupled via interfaces.',
          scoringGuide: {
            excellent: 'ElevatorDispatcher interface allows hot-swapping SCAN, LOOK, or FCFS strategies.',
            satisfactory: 'Decoupled dispatcher class.',
            needsImprovement: 'Elevator car directly implements scheduling logic.'
          }
        },
        {
          id: 'edge-cases-tradeoffs',
          name: 'Concurrency & Safety Fail-safes',
          weight: 40,
          description: 'Evaluates concurrency handling for hall calls and emergency stops.',
          scoringGuide: {
            excellent: 'Addresses race conditions when two cars pick up the same request.',
            satisfactory: 'Mentions queue mutexes.',
            needsImprovement: 'No discussion of concurrent requests or door safety.'
          }
        }
      ]
    },
    [
      {
        id: 'ext-1',
        prompt: 'How would your design adapt to VIP priority requests or fire emergency evacuation mode?',
        hint: 'Use State Pattern or Command Pattern with priority request queues.'
      }
    ],
    {
      ts: `export enum Direction { UP, DOWN, IDLE }
export enum ElevatorStatus { MOVING, STOPPED, MAINTENANCE }

export class InternalRequest {
  constructor(public destinationFloor: number) {}
}

export class ExternalRequest {
  constructor(public sourceFloor: number, public direction: Direction) {}
}

export class ElevatorCar {
  constructor(public id: string, public currentFloor: number = 0) {}
}
`
    }
  ),

  new Problem(
    'vending-machine',
    'Design a Vending Machine (State Pattern)',
    'vending-machine',
    'EASY',
    'State Machine / Behavioral Pattern',
    'Design a vending machine system that accepts coins/cash, allows product selection, dispatches items, returns change, and manages out-of-stock items using the State Pattern.',
    [
      'Support states: NoCoinState, HasCoinState, ProductSelectedState, DispensingState, SoldOutState.',
      'Allow inserting coins/cash and validating currency.',
      'Allow selecting product by inventory code (e.g. A1, B2).',
      'Dispense product and return change correctly.',
      'Support refund button before product selection.'
    ],
    [
      'Strict usage of the State Pattern to avoid huge nested if-else statements.',
      'Inventory tracking per slot/code.'
    ],
    ['VendingMachine', 'State', 'Product', 'Inventory', 'Coin', 'Dispenser'],
    {
      id: 'vending-rubric',
      criteria: [
        {
          id: 'srp-cohesion',
          name: 'State Pattern Implementation',
          weight: 40,
          description: 'Evaluates usage of the State Pattern for vending machine transitions.',
          scoringGuide: {
            excellent: 'VendingMachineState interface with clean concrete state implementations for each phase.',
            satisfactory: 'Uses state pattern with minor leaks.',
            needsImprovement: 'Relies on nested switch/if statements on a state enum.'
          }
        },
        {
          id: 'req-coverage',
          name: 'Inventory & Currency Management',
          weight: 35,
          description: 'Evaluates inventory tracking and accurate change calculation.',
          scoringGuide: {
            excellent: 'Encapsulated inventory and change dispenser.',
            satisfactory: 'Basic product map.',
            needsImprovement: 'Missing change calculation or refund capability.'
          }
        }
      ]
    },
    [
      {
        id: 'ext-1',
        prompt: 'How would you add cashless digital payments (NFC/QR Code) without altering machine state logic?',
        hint: 'Use PaymentProcessor abstraction for cash vs digital payments.'
      }
    ],
    {
      ts: `export interface State {
  insertCoin(amount: number): void;
  selectProduct(code: string): void;
  dispense(): void;
  refund(): number;
}
`
    }
  ),

  new Problem(
    'rate-limiter',
    'Design a Distributed Rate Limiter & LRU Cache',
    'rate-limiter',
    'HARD',
    'Algorithmic / Data Structure Design',
    'Design a configurable rate limiter engine (Token Bucket / Sliding Window) integrated with an LRU Cache with TTL expiration for API clients.',
    [
      'Implement Rate Limiter supporting Token Bucket or Sliding Window Log algorithm.',
      'Limit API requests per Client ID within a rolling time window (e.g., 100 req/min).',
      'Integrate an O(1) LRU (Least Recently Used) cache with TTL (Time To Live) key expiration.',
      'Return rate limit HTTP headers (X-RateLimit-Remaining, Retry-After).'
    ],
    [
      'O(1) time complexity for get(), put(), and allowRequest() operations.',
      'Extensible algorithm interface (RateLimitingStrategy).'
    ],
    ['RateLimiter', 'RateLimitingStrategy', 'TokenBucketStrategy', 'SlidingWindowStrategy', 'LRUCache', 'CacheNode'],
    {
      id: 'rate-limiter-rubric',
      criteria: [
        {
          id: 'req-coverage',
          name: 'Data Structure & O(1) Efficiency',
          weight: 40,
          description: 'Evaluates doubly linked list + hashmap implementation for LRU and bucket algorithm.',
          scoringGuide: {
            excellent: 'Proper O(1) Doubly LinkedList + Map structure.',
            satisfactory: 'O(N) search array used.',
            needsImprovement: 'Inefficient lookups.'
          }
        },
        {
          id: 'extensibility-ocp',
          name: 'Strategy Pattern Decoupling',
          weight: 30,
          description: 'Evaluates strategy pattern for switching algorithms (Token Bucket vs Sliding Window).',
          scoringGuide: {
            excellent: 'Clean Strategy interface for rate limiting algorithms.',
            satisfactory: 'Decoupled classes.',
            needsImprovement: 'Hardcoded token bucket.'
          }
        }
      ]
    },
    [
      {
        id: 'ext-1',
        prompt: 'How would you adapt this single-node rate limiter to operate in a distributed cluster with Redis?',
        hint: 'Introduce a CentralizedStateStore abstraction.'
      }
    ],
    {
      ts: `export interface RateLimitingStrategy {
  allowRequest(clientId: string): { allowed: boolean; remaining: number; retryAfterMs?: number };
}
`
    }
  )
];
