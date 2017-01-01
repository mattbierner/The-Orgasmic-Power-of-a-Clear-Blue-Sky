#import "LoveSense.h"

static const CBUUID* serviceUUID;
static const CBUUID* characteristicUUID;

@implementation LoveSenseBase

+ (void) initialize {
    serviceUUID = [CBUUID UUIDWithString:@"6E400001-B5A3-F393-E0A9-E50E24DCCA9E"];
    characteristicUUID = [CBUUID UUIDWithString:@"6E400002-B5A3-F393-E0A9-E50E24DCCA9E"];
}

- (id) initWithPeripheral:(CBPeripheral*)peripheral onReady:(void(^)(LoveSenseBase*))ready {
    _peripheral = peripheral;
    _onReady = ready;
    peripheral.delegate = self;
    [peripheral discoverServices:@[serviceUUID]];
    return self;
}

- (void)peripheral:(CBPeripheral *)peripheral didDiscoverServices:(NSError *)error {
    if (error) {
        NSLog(@"Error discovering services: %@", error);
        return;
    }
    
    for (CBService *service in peripheral.services) {
        if ([service.UUID isEqual:serviceUUID]) {
            [peripheral discoverCharacteristics:@[characteristicUUID] forService:service];
            return;
        }
    }
}

- (void)peripheral:(CBPeripheral *)peripheral
didDiscoverCharacteristicsForService:(CBService *)service
             error:(NSError *)error {
    if (error) {
        NSLog(@"Error discovering characteristics for service: %@", error);
        return;
    }
    
    for (CBCharacteristic *characteristic in service.characteristics) {
        if ([characteristic.UUID isEqual:characteristicUUID]) {
            _characteristic = characteristic;
            _onReady(self);
            return;
        }
    }
}

- (void) peripheral:(CBPeripheral *)peripheral
didUpdateValueForCharacteristic:(CBCharacteristic *)characteristic
             error:(NSError *)error {

    NSData *data = characteristic.value;
    NSLog(@"data %@", data);
}

- (void) peripheral:(CBPeripheral *)peripheral
didWriteValueForCharacteristic:(CBCharacteristic *)characteristic
             error:(NSError *)error {
    
    if (error) {
        NSLog(@"Error writing characteristic value: %@ %@",
              [error localizedDescription],
              characteristic);
    }
}


- (void) setVibration:(int)level {
    NSString* data = [NSString stringWithFormat:@"Vibrate:%i;", level];

    [_peripheral writeValue:[NSData dataWithBytes:data.UTF8String length:data.length] forCharacteristic:_characteristic
                          type:CBCharacteristicWriteWithResponse];
}


@end
