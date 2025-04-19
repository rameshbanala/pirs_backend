import sys
import torch
import torchvision.transforms as transforms
from PIL import Image
import torch.nn.functional as F
import torchvision.models as models
import torch.nn as nn
import json
import os
import requests
from io import BytesIO

try:
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image URL provided"}), flush=True)
        sys.exit(1)

    image_url = sys.argv[1]
    response = requests.get(image_url)
    response.raise_for_status()
    image = Image.open(BytesIO(response.content)).convert("RGB")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    MODEL_PATH = os.path.join(BASE_DIR, "urban_infrastructure_model.pth")
    LABELS_PATH = os.path.join(BASE_DIR, "class_indices.json")

    with open(LABELS_PATH, "r") as f:
        idx_to_label = json.load(f)

    model = models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, len(idx_to_label))

    state_dict = torch.load(MODEL_PATH, map_location=device)
    if list(state_dict.keys())[0].startswith("model."):
        state_dict = {k.replace("model.", ""): v for k, v in state_dict.items()}

    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.5] * 3, [0.5] * 3)
    ])
    tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(tensor)
        probs = F.softmax(output, dim=1)
        pred = torch.argmax(probs).item()
        conf = torch.max(probs).item()

    result = {
        "label": idx_to_label[str(pred)],
        "confidence": round(conf * 100, 2)
    }
    print(json.dumps(result), flush=True)

except Exception as e:
    print(json.dumps({"error": str(e)}), flush=True)
    sys.exit(1)
