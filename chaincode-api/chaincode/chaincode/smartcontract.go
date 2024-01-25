package chaincode

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing an Asset
type SmartContract struct {
	contractapi.Contract
}

// Asset describes basic details of what makes up a simple asset
// Insert struct field in alphabetic order => to achieve determinism across languages
// golang keeps the order when marshal to json but doesn't order automatically
type Asset struct {
	AppraisedValue int    `json:"AppraisedValue"`
	Color          string `json:"Color"`
	ID             string `json:"ID"`
	Owner          string `json:"Owner"`
	Size           int    `json:"Size"`
}

var molString string = "mol"
var lroString string = "lro"
var userString string = "user"
var molMSPID string = "Org1MSP"
var lroMSPID string = "Org2MSP"

// var prefix = time.Now().UnixMicro()

// InitLedger adds a base set of assets to the ledger
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	assets := []Asset{
		{ID: "asset1", Color: "blue", Size: 5, Owner: "Tomoko", AppraisedValue: 300},
		{ID: "asset2", Color: "red", Size: 5, Owner: "Brad", AppraisedValue: 400},
		{ID: "asset3", Color: "green", Size: 10, Owner: "Jin Soo", AppraisedValue: 500},
		{ID: "asset4", Color: "yellow", Size: 10, Owner: "Max", AppraisedValue: 600},
		{ID: "asset5", Color: "black", Size: 15, Owner: "Adriana", AppraisedValue: 700},
		{ID: "asset6", Color: "white", Size: 15, Owner: "Michel", AppraisedValue: 800},
	}

	for _, asset := range assets {
		assetJSON, err := json.Marshal(asset)
		if err != nil {
			return err
		}

		err = ctx.GetStub().PutState(asset.ID, assetJSON)
		if err != nil {
			return fmt.Errorf("failed to put to world state. %v", err)
		}
	}

	return nil
}

// CreateAsset issues a new asset to the world state with given details.
func (s *SmartContract) CreateAsset(ctx contractapi.TransactionContextInterface, id string, color string, size int, owner string, appraisedValue int) error {
	exists, err := s.AssetExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the asset %s already exists", id)
	}

	asset := Asset{
		ID:             id,
		Color:          color,
		Size:           size,
		Owner:          owner,
		AppraisedValue: appraisedValue,
	}
	assetJSON, err := json.Marshal(asset)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, assetJSON)
}

// ReadAsset returns the asset stored in the world state with given id.
func (s *SmartContract) ReadAsset(ctx contractapi.TransactionContextInterface, id string) (*Asset, error) {
	assetJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if assetJSON == nil {
		return nil, fmt.Errorf("the asset %s does not exist", id)
	}

	var asset Asset
	err = json.Unmarshal(assetJSON, &asset)
	if err != nil {
		return nil, err
	}

	return &asset, nil
}

// UpdateAsset updates an existing asset in the world state with provided parameters.
func (s *SmartContract) UpdateAsset(ctx contractapi.TransactionContextInterface, id string, color string, size int, owner string, appraisedValue int) error {
	exists, err := s.AssetExists(ctx, id)
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("the asset %s does not exist", id)
	}

	// overwriting original asset with new asset
	asset := Asset{
		ID:             id,
		Color:          color,
		Size:           size,
		Owner:          owner,
		AppraisedValue: appraisedValue,
	}
	assetJSON, err := json.Marshal(asset)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, assetJSON)
}

// DeleteAsset deletes an given asset from the world state.
func (s *SmartContract) DeleteAsset(ctx contractapi.TransactionContextInterface, id string) error {
	exists, err := s.AssetExists(ctx, id)
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("the asset %s does not exist", id)
	}

	return ctx.GetStub().DelState(id)
}

// AssetExists returns true when asset with given ID exists in world state
func (s *SmartContract) AssetExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	assetJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return assetJSON != nil, nil
}

// TransferAsset updates the owner field of asset with given id in world state, and returns the old owner.
func (s *SmartContract) TransferAsset(ctx contractapi.TransactionContextInterface, id string, newOwner string) (string, error) {
	asset, err := s.ReadAsset(ctx, id)
	if err != nil {
		return "", err
	}

	oldOwner := asset.Owner
	asset.Owner = newOwner

	assetJSON, err := json.Marshal(asset)
	if err != nil {
		return "", err
	}

	err = ctx.GetStub().PutState(id, assetJSON)
	if err != nil {
		return "", err
	}

	return oldOwner, nil
}

// GetAllAssets returns all assets found in world state
func (s *SmartContract) GetAllAssets(ctx contractapi.TransactionContextInterface) ([]*Asset, error) {
	// range query with empty string for startKey and endKey does an
	// open-ended query of all assets in the chaincode namespace.
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var assets []*Asset
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var asset Asset
		err = json.Unmarshal(queryResponse.Value, &asset)
		if err != nil {
			return nil, err
		}
		assets = append(assets, &asset)
	}

	return assets, nil
}

////////////////////////////////////////////////////////
/////////////// Chaincode for project //////////////////
////////////////////////////////////////////////////////

// structure for the Land Information
type Land struct {
	AssetID        string `json:"AssetID"`
	Authenticators []int  `json:"Authenticators"` // will store the NID of approvers
	Comment        string `json:"Comment"`
	DagNo          int    `json:"DagNo"`
	DeedID         string `json:"DeedID"`
	District       string `json:"District"`
	Division       string `json:"Division"`
	KhatianNo      int    `json:"KhatianNo"`
	Mouza          string `json:"Mouza"`
	NEC            string `json:"NEC"` // file
	OwnerName      string `json:"OwnerName"`
	OwnerNID       int    `json:"OwnerNID"`
	PayTx          string `json:"PayTx"`
	Status         string `json:"Status"`
	Upazila        string `json:"Upazila"`
}

type Dashboard struct {
	AssetID  string `json:"AssetID"`
	District string `json:"District"`
	Status   string `json:"Status"`
	Upazila  string `json:"Upazila"`
}

// structure for Land Deed (dalil)
type Deed struct {
	AssetID        string `json:"AssetID"`
	Authenticators []int  `json:"Authenticators"` // will store the NID of approvers
	DagNo          int    `json:"DagNo"`
	DeedID         string `json:"DeedID"`
	District       string `json:"District"`
	Division       string `json:"Division"`
	KhatianNo      int    `json:"KhatianNo"`
	Mouza          string `json:"Mouza"`
	OwnerName      string `json:"OwnerName"`
	OwnerNID       int    `json:"OwnerNID"`
	Upazila        string `json:"Upazila"`
}

// Create or Register Land function
func (s *SmartContract) CreateApplication(ctx contractapi.TransactionContextInterface, dagNo int, dist string, div string, khatianNo int, mouza string, nec string, oName string, oNID int, payTx string, upazila string) (string, error) {
	var prefix1 string = strings.ToLower(dist)
	var prefix2 string = strings.ToLower(div)
	var prefix3 string = strings.ToLower(mouza)
	var prefix4 string = strings.ToLower(upazila)
	id := fmt.Sprintf("%d%s%s%d%s%s", dagNo, prefix1, prefix2, khatianNo, prefix3, prefix4)

	exists, err := s.AssetExists(ctx, id)
	if err != nil {
		return "", err
	}
	if exists {
		return "", fmt.Errorf("Someone already applied for %s", id)
	}

	land := Land{
		AssetID:        id,
		Authenticators: []int{},
		Comment:        "",
		DagNo:          dagNo,
		DeedID:         "",
		District:       dist,
		Division:       div,
		KhatianNo:      khatianNo,
		Mouza:          mouza,
		NEC:            nec,
		OwnerName:      oName,
		OwnerNID:       oNID,
		PayTx:          payTx,
		Status:         "pending",
		Upazila:        upazila,
	}

	landJSON, err := json.Marshal(land)
	if err != nil {
		return "", err
	}

	err = ctx.GetStub().PutState(id, landJSON)
	if err != nil {
		return "", fmt.Errorf("Failed to save application in ledger: %v", err)
	}

	return ctx.GetStub().GetTxID(), nil
}

func (s *SmartContract) ResubmitApplication(ctx contractapi.TransactionContextInterface, id string, dagNo int, dist string, div string, khatianNo int, mouza string, nec string, oName string, oNID int, payTx string, upazila string) (*Land, error) {
	landJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("Failed to read from world state: %v", err)
	}
	if landJSON == nil {
		return nil, fmt.Errorf("Land info %s doesn't exist", id)
	}

	var land Land
	err = json.Unmarshal(landJSON, &land)
	if err != nil {
		return nil, err
	}

    if oNID != land.OwnerNID {
		return nil, fmt.Errorf("Not authorized")
    }

	land.DagNo = dagNo
	land.District = dist
	land.Division = div
	land.KhatianNo = khatianNo
	land.Mouza = mouza
	land.NEC = nec
	land.PayTx = payTx
	land.Status = "pending"
	land.Upazila = upazila

	landJSON, err = json.Marshal(land)
	if err != nil {
		return nil, err
	}

	err = ctx.GetStub().PutState(id, landJSON)
	if err != nil {
		return nil, fmt.Errorf("Failed to save application in ledger: %v", err)
	}

	return &land, nil
}

func (s *SmartContract) ReadApplicationByID(ctx contractapi.TransactionContextInterface, id string, oNID int, userType string) (*Land, error) {
	landJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("Failed to read from world state: %v", err)
	}
	if landJSON == nil {
		return nil, fmt.Errorf("Land info %s doesn't exist", id)
	}

	var land Land
	err = json.Unmarshal(landJSON, &land)
	if err != nil {
		return nil, err
	}
	if land.PayTx == "" {
		return nil, fmt.Errorf("Not found")
	}

	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return nil, fmt.Errorf("Failed to get client's MSPID: %v", err)
	}

	if userType != "user" {
		if clientMSPID == molMSPID && land.Status != "pending" {
			return nil, fmt.Errorf("Not authorized MOL\n clientMSP: %s\n orgMSP: %s \n status: %s", clientMSPID, molMSPID, land.Status)
		}
		if clientMSPID == lroMSPID && land.Status != "approved" {
			return nil, fmt.Errorf("Not authorized LRO\n clientMSP: %s\n orgMSP: %s \n status: %s", clientMSPID, lroMSPID, land.Status)
		}
	} else {
		if land.OwnerNID != oNID {
			return nil, fmt.Errorf("Not authorized")
		}
	}
	return &land, nil
}

func contains(slice []int, nid int) bool {
	for _, v := range slice {
		if v == nid {
			return true
		}
	}
	return false
}

func appendUnique(land *Land, nid int) {
	if !contains(land.Authenticators, nid) {
		land.Authenticators = append(land.Authenticators, nid)
	}
}

func (s *SmartContract) ApproveApplication(ctx contractapi.TransactionContextInterface, id string, comment string, adminNID int, response bool, userType string) error {
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("Failed to get client's MSPID: %v", err)
	}

	if userType == userString || clientMSPID != molMSPID {
		return fmt.Errorf("Authorization limited to Ministry of Land: %v", clientMSPID)
	}

	landJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return fmt.Errorf("Failed to read from world state: %v", err)
	}
	if landJSON == nil {
		return fmt.Errorf("Land info %s doesn't exist", id)
	}

	var land Land
	err = json.Unmarshal(landJSON, &land)
	if err != nil {
		return err
	}

	if land.Status != "pending" {
		return fmt.Errorf("Not authorized MOL")
	}

	var status string
	if response {
		status = "approved"
		comment = "Land registerd by Land Revenue Office"
	} else {
		status = "rejected"
	}

	land.Status = status
	land.Comment = comment
	appendUnique(&land, adminNID)
	landJSON, err = json.Marshal(land)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, landJSON)
}

func (s *SmartContract) GenerateDeed(ctx contractapi.TransactionContextInterface, land Land) (string, error) {
	prfx := time.Now().Unix()
	id := fmt.Sprintf("%d%s", prfx, land.AssetID)
	exists, err := s.AssetExists(ctx, id)
	if err != nil {
		return "", err
	}
	if exists {
		return "", fmt.Errorf("Someone already applied for %s", id)
	}

	deed := Deed{
		AssetID:        land.AssetID,
		Authenticators: land.Authenticators,
		DagNo:          land.DagNo,
		DeedID:         id,
		District:       land.District,
		Division:       land.Division,
		KhatianNo:      land.KhatianNo,
		Mouza:          land.Mouza,
		OwnerName:      land.OwnerName,
		OwnerNID:       land.OwnerNID,
		Upazila:        land.Upazila,
	}
	deedJSON, err := json.Marshal(deed)
	if err != nil {
		return "", err
	}

	err = ctx.GetStub().PutState(id, deedJSON)
	if err != nil {
		return "", err
	}

	return id, nil
}

func (s *SmartContract) RegisterApplication(ctx contractapi.TransactionContextInterface, id string, comment string, adminNID int, response bool, userType string) error {
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("Failed to get client's MSPID: %v", err)
	}

	if userType == userString || clientMSPID != lroMSPID {
		return fmt.Errorf("Authorization limited to Land Revenue Office: %v", clientMSPID)
	}

	landJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return fmt.Errorf("Failed to read from world state: %v", err)
	}
	if landJSON == nil {
		return fmt.Errorf("Land info %s doesn't exist", id)
	}

	var land Land
	err = json.Unmarshal(landJSON, &land)
	if err != nil {
		return err
	}

	if land.Status != "approved" {
		return fmt.Errorf("Not authorized LRO")
	}

	var status string
	if response {
		status = "registered"
		comment = "Land registerd by Land Revenue Office"
	} else {
		status = "rejected"
	}

	land.Status = status
	land.Comment = comment
	appendUnique(&land, adminNID)
	if land.DeedID == "" {
		land.DeedID, err = s.GenerateDeed(ctx, land)
		if err != nil {
			return fmt.Errorf("Failed to generate Deed")
		}
	}
	landJSON, err = json.Marshal(land)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, landJSON)
}

func (s *SmartContract) GetAllUserApplications(ctx contractapi.TransactionContextInterface, oNID int, userType string) ([]*Dashboard, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var lands []*Dashboard
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var land Land
		err = json.Unmarshal(queryResponse.Value, &land)
		if err != nil {
			return nil, err
		}
		if land.PayTx == "" {
			continue
		}

		// Checking if the land owned by the user
		if land.OwnerNID == oNID {
			dashboardLand := Dashboard{
				AssetID:  land.AssetID,
				District: land.District,
				Status:   land.Status,
				Upazila:  land.Upazila,
			}
			lands = append(lands, &dashboardLand)
		}
	}
	return lands, nil
}

func (s *SmartContract) GetAllCertificates(ctx contractapi.TransactionContextInterface) ([]*Deed, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var deeds []*Deed
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var land Land
		err = json.Unmarshal(queryResponse.Value, &land)
		if err != nil {
			return nil, err
		}
		if land.NEC != "" {
			continue
		}

		deed := Deed{
			AssetID:        land.AssetID,
			Authenticators: land.Authenticators,
			DagNo:          land.DagNo,
			DeedID:         land.DeedID,
			District:       land.District,
			Division:       land.Division,
			KhatianNo:      land.KhatianNo,
			Mouza:          land.Mouza,
			OwnerName:      land.OwnerName,
			OwnerNID:       land.OwnerNID,
			Upazila:        land.Upazila,
		}
		deeds = append(deeds, &deed)
	}
	return deeds, nil
}

func (s *SmartContract) ReadDeedByID(ctx contractapi.TransactionContextInterface, id string) (*Deed, error) {
	deedJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("Failed to read from world state: %v", err)
	}
	if deedJSON == nil {
		return nil, fmt.Errorf("Deed info %s doesn't exist", id)
	}

	var deed Deed
	err = json.Unmarshal(deedJSON, &deed)
	if err != nil {
		return nil, err
	}

	// Checking if land is registered or not
	landJson, err := ctx.GetStub().GetState(deed.AssetID)
	if err != nil {
		return nil, fmt.Errorf("Failed to read from world state: %v", err)
	}
	if landJson == nil {
		return nil, fmt.Errorf("Deed info %s doesn't exist")
	}

	var land Land
	err = json.Unmarshal(landJson, &land)
	if err != nil {
		return nil, err
	}

    if land.Status != "registered" {
        return nil, fmt.Errorf("Land is not registered yet")
    }

	return &deed, nil
}

func (s *SmartContract) TransferOwnerShip(ctx contractapi.TransactionContextInterface, id string, oNID int, newOName string, newONID int) error {
	landJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return fmt.Errorf("Failed to read from world state: %v", err)
	}
	if landJSON == nil {
		return fmt.Errorf("Land info %s doesn't exist", id)
	}

	var land Land
	err = json.Unmarshal(landJSON, &land)
	if err != nil {
		return err
	}

	if land.OwnerNID != oNID {
		return fmt.Errorf("Not authorized\nOwner: %d\nRequesting: %d", land.OwnerNID, oNID)
	}
	err = s.DeleteAsset(ctx, land.DeedID)
	if err != nil {
		return err
	}

	land.OwnerName = newOName
	land.OwnerNID = newONID
	land.Status = "pending"
	landJSON, err = json.Marshal(land)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, landJSON)

}

func (s *SmartContract) GetAllAdminApplications(ctx contractapi.TransactionContextInterface, oNID int, userType string) ([]*Dashboard, error) {
	if userType == userString {
		return nil, fmt.Errorf("User not authorized")
	}

	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return nil, fmt.Errorf("Failed to get client's MSPID: %v", err)
	}

	var lands []*Dashboard
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var land Land
		err = json.Unmarshal(queryResponse.Value, &land)
		if err != nil {
			return nil, err
		}

		if land.PayTx == "" {
			continue
		}

		if (clientMSPID == molMSPID && land.Status == "pending") ||
			(clientMSPID == lroMSPID && land.Status == "approved") {
			dashboardLand := Dashboard{
				AssetID:  land.AssetID,
				District: land.District,
				Status:   land.Status,
				Upazila:  land.Upazila,
			}
			lands = append(lands, &dashboardLand)
		}
	}
	return lands, nil
}
