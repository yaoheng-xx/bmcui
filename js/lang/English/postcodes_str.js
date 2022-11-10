"use strict";
var array = {};                 // declare empty object
array.postcodes_decode_str = new Array();

array.postcodes_decode_str["UNDEFINED"] = "Undefined";

// SEC Phase
array.postcodes_decode_str["0x01"] = "First POST code after CPU reset";
array.postcodes_decode_str["0x02"] = "Microcode load begin";
array.postcodes_decode_str["0x03"] = "CRAM initialization begin";
array.postcodes_decode_str["0x04"] = "PEI Cache When Disabled";
array.postcodes_decode_str["0x05"] = "SEC Core At Power On Begin";
array.postcodes_decode_str["0x06"] = "Early CPU initialization during SEC Phase";
// KTI RC
array.postcodes_decode_str["0xA1"] = "Collect infor such as SBSP, boot mode, reset type, etc.";
array.postcodes_decode_str["0xA3"] = "Setup minimum path between SBSP and other sockets";
array.postcodes_decode_str["0xA6"] = "Sync up with PBSPs";
array.postcodes_decode_str["0xA7"] = "Topology discovery and route calculation";
array.postcodes_decode_str["0xA8"] = "Program final route";
array.postcodes_decode_str["0xA9"] = "Program final IO SAD setting";
array.postcodes_decode_str["0xAA"] = "Protocol layer and other uncore settings";
array.postcodes_decode_str["0xAB"] = "Transition links to full speed operation";
array.postcodes_decode_str["0xAE"] = "Coherency settings";
array.postcodes_decode_str["0xAF"] = "KTI initialization done";
// PEI Phase
array.postcodes_decode_str["0x10"] = "PEI Core";
array.postcodes_decode_str["0x11"] = "CPU PEIM";
array.postcodes_decode_str["0x15"] = "Platform Type Init";
array.postcodes_decode_str["0x19"] = "Platform PEIM Init";
// MRC Progress Codes
array.postcodes_decode_str["0xB0"] = "Detect DIMM population";
array.postcodes_decode_str["0xB1"] = "Set DDR4 frequency";
array.postcodes_decode_str["0xB2"] = "Gather remaining SPD data";
array.postcodes_decode_str["0xB3"] = "Program registers on the memory controller level";
array.postcodes_decode_str["0xB4"] = "Evaluate RAS modes and save rank information";
array.postcodes_decode_str["0xB5"] = "Program registers on the channel level";
array.postcodes_decode_str["0xB6"] = "Perform the JEDEC defined initialization sequence";
array.postcodes_decode_str["0xB7"] = "Train DDR4 ranks";
array.postcodes_decode_str["0xB8"] = "Initialize CLTT/OLTT";
array.postcodes_decode_str["0xB9"] = "Hardware memory test and init";
array.postcodes_decode_str["0xBA"] = "Execute software memory init";
array.postcodes_decode_str["0xBB"] = "Program memory map and interleaving";
array.postcodes_decode_str["0xBC"] = "Program RAS configuration";
array.postcodes_decode_str["0xBF"] = "MRC is done";
array.postcodes_decode_str["0x31"] = "Memory installed";
array.postcodes_decode_str["0x32"] = "CPU PEIM (CPU Init)";
array.postcodes_decode_str["0x33"] = "CPU PEIM (Cache Init)";
array.postcodes_decode_str["0x34"] = "CPU BSP Select";
array.postcodes_decode_str["0x35"] = "CPU AP Init";
array.postcodes_decode_str["0x36"] = "CPU SMM Init";
array.postcodes_decode_str["0x4F"] = "DXE IPL Started";

// S3 Resume
array.postcodes_decode_str["0xE0"] = "S3 Resume PEIM (S3 started)";
array.postcodes_decode_str["0xE1"] = "S3 Resume PEIM (S3 boot script)";
array.postcodes_decode_str["0xE2"] = "S3 Resume PEIM (S3 Video Repost)";
array.postcodes_decode_str["0xE3"] = "S3 Resume PEIM (S3 OS wake)";
// BIOS Recovery
array.postcodes_decode_str["0xF0"] = "PEIM which detected forced Recovery condition";
array.postcodes_decode_str["0xF1"] = "PEIM which detected User Recovery condition";
array.postcodes_decode_str["0xF2"] = "Recovery PEIM (Recovery started)";
array.postcodes_decode_str["0xF3"] = "Recovery PEIM (Capsule found)";
array.postcodes_decode_str["0xF4"] = "Recovery PEIM (Capsule loaded)";

// Others
array.postcodes_decode_str["0xE5"] = "CPU mismatch error";
array.postcodes_decode_str["0xE6"] = "CPU mismatch error";
