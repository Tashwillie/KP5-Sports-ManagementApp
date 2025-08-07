"use client";

export default function TestBootstrapPage() {
  return (
    <div className="container mt-5">
      <h1 className="text-primary">Bootstrap Test Page</h1>
      
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Test Card</h5>
            </div>
            <div className="card-body">
              <p className="card-text">This is a test card to verify Bootstrap is working.</p>
              <button className="btn btn-primary">Primary Button</button>
              <button className="btn btn-secondary ms-2">Secondary Button</button>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="alert alert-success">
            <strong>Success!</strong> Bootstrap is working if you can see this styled alert.
          </div>
          
          <div className="form-group">
            <label htmlFor="testInput" className="form-label">Test Input</label>
            <input type="text" className="form-control" id="testInput" placeholder="Enter text here" />
          </div>
        </div>
      </div>
    </div>
  );
} 